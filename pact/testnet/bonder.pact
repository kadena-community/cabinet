;; The Bonder contract is designed to manage Kadena (KDA) token
;; transactions and governance in a decentralized manner. It
;; provides a range of functionalities, central to which are:
;;
;; 1. Bond Creation: The contract Operator can create bond sales,
;; offering KDA rewards as incentives. This function is primarily
;; handled by `create-bond`.
;;
;; 2. Token Locking for Yield: Users have the ability to `lock` their
;; KDA tokens within the contract. This action enables them to accrue
;; yield rewards over time, contributing to a passive income stream.
;;
;; 3. Managing participation metrics: Users that participate on governance polls
;; may have their APR boosted. This will be done via the `increment-bonder-interactions`
;; and `increment-bond-polls`
;;
;; 4. Claiming lockups: The more tokens a user locks, the greater
;; their influence in decision-making processes. This mechanism encourages
;; active participation and investment in the ecosystem.
;;
;; 5. Exceeding rewards management: If a user does not participate in all the polls
;; there will be a difference between the max-rewards (locked) and the actual rewards
;; the user will get. These exceediing rewards are then made available for other participants
;; of the same bond.
                                        ;
;; Operational Mechanics:
;;
;; - Token Management: The Bonder contract acts as a custodian of KDA tokens,
;; holding them on behalf of users and bond creators. It autonomously tracks and
;; manages each user's token position and associated rewards.
;;
;; - Main Entrypoints: The core functionalities of this contract are accessible
;; through the `create-bond`, `lock`, and `claim` functions. These entrypoints
;; facilitate bond creation, token locking for yield accrual, and claiming of
;; accrued rewards, respectively.
;;
;; This contract aims to provide a transparent and efficient way for users to
;; engage with the Kadena ecosystem, financially incentivizing
;; governance participation.


(namespace (read-msg 'ns))
(module bonder GOVERNANCE

  @model
  [
   (defproperty valid-bond
       (total-rewards:decimal
        base-apr:decimal
        min-amount:decimal
        max-amount:decimal)
     (and (and (and (and
                     (>= total-rewards 0.0) ;; A bond needs to have positive rewards
                     (>= base-apr 1.0)) ;; Needs to give some APR to bonders
                    (> max-amount 0.0)) ;; Should have positive maximum amount
               (> min-amount 0.0)) ;; Should have positive maximum amount
          (> max-amount min-amount)) ;; Maximum amount should be greater than minimum
     )

   (defproperty valid-option
       (time-multiplier:decimal
        poller-max-boost:decimal
        polling-power-multiplier:decimal)
     (fold (and) true
           (>= time-multiplier 1.0) ;; Time multiplier should be at least 1.0
           (>= poller-max-boost 1.0) ;; Poller max boost should be at least 1.0
           (>= polling-power-multiplier 1.0) ;; Poller max boost should be at least 1.0
           )
     )
   ]

  ;; Depedencies
  (use util.guards [chain-time at-after-date at-before-date])


  ;; this is a simple global lock that can be toggled by the operators to pause the contract if necessary
  (defschema contract-lock-status
      lock:bool)
  (deftable contract-lock:{contract-lock-status})
  (defconst CONTRACT_LOCK_KEY 'lock)
  (defun enforce-contract-unlocked ()
    "Asserts that the contract is not in a paused state."
    (with-read contract-lock CONTRACT_LOCK_KEY { 'lock := lock }
               (enforce (not lock) "Contract is paused")))
  (defun is-contract-locked ()
    "Asserts that the contract is not in a paused state."
    (with-read contract-lock CONTRACT_LOCK_KEY { 'lock := lock }
               lock))
  (defun set-contract-lock
      ( lock:bool )
    (with-capability (OPS)
      (write contract-lock CONTRACT_LOCK_KEY {'lock: lock })))



  ;; General Capabilities
  (defcap GOVERNANCE ()
    (enforce-guard
     (keyset-ref-guard "n_e611558dc9a9858b027d8c2e04bb431de8f7668c.bonder-admin")))

  (defcap OPS ()
    (enforce-guard
     (keyset-ref-guard "n_e611558dc9a9858b027d8c2e04bb431de8f7668c.bonder-ops")))

  (defcap ACCOUNT_GUARD
      (account:string)
    @doc "Look up the guard for an account, required to interact with the contract."
    (enforce-guard (at 'guard (coin.details account))))

  ;; Schemas and tables
  (defschema lockup-option
      @doc "Tracks the lockup options and their corresponding rewards."
      @model [
              (invariant (>= time-multiplier 1.0))
              (invariant (>= poller-max-boost 1.0))
              (invariant (>= polling-power-multiplier 1.0))
              (invariant (> option-length 0))
              (invariant (> (length option-name) 0))
              ]
      option-name:string
      option-length:integer
      time-multiplier:decimal
      poller-max-boost:decimal
      polling-power-multiplier:decimal)



  (defschema bond-sale
      @doc
    "Tracks the bond sales created by the contract operator"
    @model [
            (invariant (>= total-rewards 0.0))
            (invariant (> max-amount 0.0))
            (invariant (> min-amount 0.0))
            (invariant (> max-amount min-amount))
            (invariant (>= base-apr 1.0))
            (invariant (>= (length lockup-options) 1))
            (invariant (>= total-polls 0))
            ]
    bond-id:string
    creator:string
    start-time:time
    lockup-options:[object{lockup-option}]
    whitelisted-accounts:[string]
    base-apr:decimal
    max-amount:decimal
    min-amount:decimal
    total-rewards:decimal
    locked-rewards:decimal
    given-rewards:decimal
    total-polls:integer
    active-bonders:integer
    total-vp: decimal
    )

  ;; Keys in format: [account "-" start "-" end]
  (deftable bond-sales:{bond-sale})

  (defschema lockup
      @doc
    "Tracks KDA bonding position of the bonder contract's users"
    @model [
            ;; Users can not lock negative amounts
            (invariant (>= kda-locked 0.0))
            ;; Only these two statuses are allowed
            (invariant (or ( = status "locked") (= status  "claimed")))
            ]
    lockup-id:string
    bond-id:string
    account:string
    lockup-option:object{lockup-option}
    lockup-start-time:time
    polling-power:decimal
    lockup-end-time:time
    kda-locked:decimal
    interactions:integer
    max-kda-rewards:decimal
    status:string ;; Can be: ["locked" "claimed"]
    claimed-rewards:decimal
    polls-at-lock:integer
    )

  ;; Keys stored in format "bond-id:::account"
  (deftable lockups:{lockup})

  (defschema bond-creator
      @doc "Tracks accounts allowed to create a bond"
      ;;key is account
      is-active:bool
      )

  (defun get-account-lockup-interactions:integer
      (bond-id:string
       account:string)

    (at 'interactions (at 0 (filter (lambda (x) (= (at 'bond-id x) bond-id)) (get-account-active-lockups account))))
    )

  (deftable bond-creators:{bond-creator})

  (defun add-bond-creator
      (account:string)
    @doc "Operator only. Add an account as bonder creator"
    (enforce-contract-unlocked)
    (with-capability (OPS)
      (write bond-creators account
             {'is-active: true})
      )
    )

  (defun BONDER_BANK:string ()
    (create-principal (bonder-bank-guard))
    )

  (defcap BANK_DEBIT ()
    @doc "Manages transfers from contract account"
    true)

  (defun bonder-bank-guard:guard ()
    @doc "Guard for bonder bank operations, allowing debiting from the bank."
    (create-capability-guard (BANK_DEBIT)))

  ;; Methods
  (defun init (initial-lock:bool)
    @doc "Initializes the contract by creating the bonder bank account with the appropriate guard. \
       \  Fails if already created."
    (coin.create-account (BONDER_BANK) (bonder-bank-guard))
    (insert contract-lock CONTRACT_LOCK_KEY {'lock: initial-lock})
    (insert keys-table BOND_KEY {'bonds:[], 'lockups:[]})
    (insert keys-table LOCKUP_KEY {'bonds:[], 'lockups:[]})
    )

  (defun get-bond-id:string
      (account:string
       start-time:time)
    "Helper method to retrieve the key of a specific bond from account, start and end dates"
    (let (
          (start:string (format-time "%F" start-time))
          )
      (fold (+) ""
            [start "-" account])))

  (defun validate-bond
      (bond:object{bond-sale})
    @doc "Validates the parameters of a bond sale to ensure correctness and consistency before creation. \
      \  - Ensures the total rewards are positive. \
      \  - Verifies the end time is after the start time. \
      \  - Requires a positive base APR for bonders. \
      \  - Validates the maximum and minimum bond amounts, ensuring the maximum is greater than the minimum. \
      \  - Ensures there is at least one lockup option and validates each lockup option using the `validate-lockup-options` function."

    (enforce (>= (at 'total-rewards bond) 0.0) "A bond needs to have positive rewards")
    (let (
          (max-amount:decimal (at 'max-amount bond))
          (min-amount:decimal (at 'min-amount bond))
          (base-apr:decimal (at 'base-apr bond))
          (lockup-options:[object{lockup-option}] (at 'lockup-options bond))
          )
      ;; Added the enforce unit as required in fv
      (enforce (coin.enforce-unit min-amount) "Min amount violates coin precision")
      (enforce (coin.enforce-unit max-amount) "Max amount violates coin precision")
      (enforce (coin.enforce-unit base-apr) "Base APR violates coin precision")
      (enforce (>= base-apr 1.0) "Need to give some APR to bonders")
      (enforce (> max-amount 0.0) "Bond should have positive maximum amount")
      (enforce (> min-amount 0.0) "Bond should have positive maximum amount")
      (enforce (> max-amount min-amount) "Maximum amount should be greater than minimum")
      (enforce (>= (length lockup-options) 1) "There needs to be at least one lockup option")
      (validate-lockup-options lockup-options)
      )
    )

  (defun validate-lockup-option:bool
      (option:object{lockup-option})
    @doc "Validates the lockup option object to ensure it meets certain criteria: \
       \    - Time multiplier should be at least 1.0 \
       \    - Poller max boost should be at least 1.0 \
       \    - Polling power should be at least 1.0 \
       \    - Length should be greater than 0.0"
    (let (
          (time-multiplier:decimal (at 'time-multiplier option))
          (poller-max-boost:decimal (at 'poller-max-boost option))
          (polling-power-multiplier:decimal (at 'polling-power-multiplier option))
          (option-length:integer (at 'option-length option)))
      (enforce (coin.enforce-unit time-multiplier) "Time multiplier violates coin precision")
      (enforce (coin.enforce-unit poller-max-boost) "Poller max boost violates coin precision")
      (enforce (coin.enforce-unit polling-power-multiplier) "PP multiplier violates coin precision")
      (enforce (>= time-multiplier 1.0) "Time multiplier should be at least 1.0")
      (enforce (>= poller-max-boost 1.0) "Poller max boost should be at least 1.0")
      (enforce (>= polling-power-multiplier 1.0) "Polling power should be at least 1.0")
      (enforce (>  option-length 0) "Lockup options should have positive lenght")
      ))


  (defun validate-lockup-options
      (options:[object{lockup-option}])
    @doc "Validates an array of lockup options to ensure they meet certain criteria: \
         \ - Each lockup option in the array must be individually validated using the `validate-lockup-option` method. \
         \ - The lengths of the lockup options must be distinct."
    (map (validate-lockup-option) options)
    (let* (
           (lengths:[integer] (map (at 'option-length) options))
           (valid-length:bool (= lengths (distinct lengths))))
      (enforce valid-length "All lockup options should be distinct")))


  (defcap CREATE_BOND
      (bond:object{bond-sale})
    @doc "Ability to create bonds. Enforces the guard has required privileges and the bond has valid parameters. \
       \ - Requires the creator to be a Core Member."
    @event
    (enforce-guard (at-before-date (at 'start-time bond)))
    (with-default-read bond-creators (at 'creator bond)
      {'is-active: false}
      {'is-active:= status}
      (enforce (= true status) "You must be a Core Member to create bond sales.")
      (validate-bond bond)
      )
    )

  (defun create-bond:string
      (start-time:time
       lockup-options:[object{lockup-option}]
       whitelisted-accounts:[string]
       min-amount:decimal
       max-amount:decimal
       base-apr:decimal
       account:string
       total-rewards:decimal)
    @doc "Creates a bond sale within the stipulated time frame. Only Core Team can perform this action. \
         \ Rewards are transferred to Bonder Account upon bond creation."
    @model [ (property (valid-bond total-rewards base-apr min-amount max-amount)) ]
    (enforce-contract-unlocked)
    (let* (
           (n-bonds:integer (+ 1 (length (get-bond-keys))))
           (bond-id:string (format "BOND-{}" [n-bonds]))
           (bond:object{bond-sale} {'bond-id: bond-id
                                              , 'creator: account
                                              , 'start-time: start-time
                                              , 'lockup-options: lockup-options
                                              , 'whitelisted-accounts: whitelisted-accounts
                                              , 'base-apr: base-apr
                                              , 'max-amount: max-amount
                                              , 'min-amount: min-amount
                                              , 'total-rewards: total-rewards
                                              , 'locked-rewards: 0.0
                                              , 'given-rewards: 0.0
                                              , 'total-polls: 0
                                              , 'active-bonders:0
                                              , 'total-vp: 0.0})

           )
      (with-capability (CREATE_BOND bond)
        (coin.transfer account (BONDER_BANK) total-rewards)
        (insert bond-sales bond-id bond)
        (with-default-read keys-table BOND_KEY {'bonds:[] , 'lockups:[]} {'bonds:= bonds, 'lockups:=lockups }
                           (write keys-table BOND_KEY {'bonds: (+ bonds [bond-id]), 'lockups:[] })
                           )

        )
      (format "Bond {} - from {} has been created" [bond-id (format-time "%c" start-time)])))

  (defun get-bond-lockup-option:object{lockup-option}
    (bond-id:string
     option-length:integer)
    @doc "Retrieves the lockup option associated with a specific bond with a determined length."

    (let* ((options:[object{lockup-option}] (filter
                                             (where 'option-length (= option-length))
                                             (with-read bond-sales bond-id
                                               {'lockup-options := lockup-options}
                                               lockup-options)))
           (len (length options)))
      (enforce (> len 0) "Option not found")
      (at 0 options))
    )

  (defun read-bond:object{bond-sale}
    (bond-id:string)
    @doc "Get bond info from a specific bond-id"
    (read bond-sales bond-id)
    )

  ;; Store bond keys in a table
  (defschema keys-schema
      @doc "Schema for storing table keys and optimize gas consumption"
      bonds:[string]
      lockups:[string])

  (defconst BOND_KEY:string "all-bonds")

  (defconst LOCKUP_KEY:string "all-lockups")

  (deftable keys-table:{keys-schema})

  (defun get-bond-keys:[string] ()
         @doc "Retrieves the keys from bond-keys table"
         ;; NOTE: use (keys) instead if you want FV the contract
         ;; (keys bond-sales
         (with-read keys-table BOND_KEY {'bonds := bonds} bonds)
         )

  (defun get-lockup-keys:[string] ()
         @doc "Retrieves the keys from bond-keys table"
         ;; NOTE: use (keys) instead if you want FV the contract
         ;; (keys bond-sales
         (with-read keys-table LOCKUP_KEY {'lockups := lockups} lockups)
         )

  (defun read-lockup:object{lockup}
    (lockup-id:string)
    @doc "Reads lockup details based on the provided lockup ID."
    (read lockups lockup-id))

  (defun is-bonder-account:bool
      (account:string)
    @doc "Returns true if the acount has a lock position in at least one bond"
    (fold (or) false (map (lambda (x) (is-account-bonded x account)) (get-bond-keys)))
    )

  (defun is-bond-active:bool
      (bond-id:string)
    @doc "Returns true if the bond is active"
    (with-read bond-sales bond-id
      {'active-bonders := n-bonds}
      (> n-bonds 0)
      ))


  (defun calculate-max-rewards:decimal
      (amount:decimal
       lockup-length:integer
       bond-id:string)
    @doc "Calculates the maximum rewards that can be earned based on the locked amount, lockup length, and bond parameters."
    (let*
        (
         (bond:object{bond-sale} (read-bond bond-id))
         (base-apr:decimal (at 'base-apr (read-bond bond-id)))
         (option:object{lockup-option} (get-bond-lockup-option bond-id lockup-length))
         (time-multiplier:decimal (at 'time-multiplier option))
         (max-boost:decimal (at 'poller-max-boost option))
         (min-amount:decimal (at 'min-amount bond))
         (max-amount:decimal (at 'max-amount bond))
         )
      (enforce (and (>= amount min-amount) (<= amount max-amount))
               (format "Only amounts between {} and {} can be locked" [min-amount max-amount]))
      (floor (- (* amount (* (* base-apr max-boost) time-multiplier)) amount) (coin.precision)))
    )

  (defun calculate-min-rewards:decimal
      (amount:decimal
       lockup-length:integer
       bond-id:string)
    @doc "Calculates the minimum rewards that can be earned based on the locked amount, lockup length, and bond parameters."
    (let*
        (
         (bond:object{bond-sale} (read-bond bond-id))
         (base-apr:decimal (at 'base-apr (read-bond bond-id)))
         (option:object{lockup-option} (get-bond-lockup-option bond-id lockup-length))
         (time-multiplier:decimal (at 'time-multiplier option))
         (min-amount:decimal (at 'min-amount bond))
         (max-amount:decimal (at 'max-amount bond))
         )
      (enforce (and (>= amount min-amount) (<= amount max-amount))
               (format "Only amounts between {} and {} can be locked" [min-amount max-amount]))
      (floor (- (* amount (* base-apr time-multiplier)) amount) (coin.precision))
      ))

  (defun is-account-bonded:bool
      (bond-id:string
       account:string)
    "Returns true if the account has at least one unclaimed lockup"
    (let* (
           (bond-account-lockups (filter
                                  (lambda (x)
                                    (and (= (at 'bond-id x) bond-id) (= (at 'account x) account)))
                                  (map (read-lockup) (get-lockup-keys))
                                  )))
      (fold (or) false (map (lambda (x) (= (at 'status x) "locked")) bond-account-lockups)))

    )

  (defun get-bond-account-lockups:[object{lockup}]
    (bond-id:string
     account:string)

    (filter (lambda (x)
              (and (= (at 'bond-id x) bond-id) (= (at 'account x) account))
              )
            (map (read-lockup) (get-lockup-keys))
            )

    )

  (defun get-bond-lockups:[object{lockup}]
    (bond-id:string)

    (filter (lambda (x)
              (= (at 'bond-id x) bond-id))
            (map (read-lockup) (get-lockup-keys))
            )

    )


  (defun get-lockup-key:string
      (bond-id:string
       account:string)
    "Helper method to retrieve the key of a specific lockup from account and bond-id"
    (let* (
           (n-lockups (length (get-lockup-keys)))
           (bond-account-lockups (get-bond-account-lockups bond-id account))
           )
      (if (>= (length bond-account-lockups) 1)
          (let* (
                 (ongoing-lockups (filter (lambda (x) (= (at 'status x) "locked"))
                                          bond-account-lockups))
                 (n-ongoing-lockups (length ongoing-lockups))
                 )
            (enforce (>= 1 n-ongoing-lockups) "Sanity check: Only one ongoing lockup per account/bond is allowed")
            (if (> n-ongoing-lockups 0)  (at 'lockup-id (at 0 ongoing-lockups)) (format "LOCKUP-{}" [(+ 1 n-lockups)]))
            )
          (format "LOCKUP-{}" [(+ 1 n-lockups)])

          )))




  (defcap LOCK
      (bond-id:string
       account:string
       amount: decimal
       rewards:decimal)
    @doc "Lockup KDA rights event"
    @event
    (with-read bond-sales bond-id
      { 'start-time := start-time
                    , 'total-rewards := total-rewards
                    , 'locked-rewards := locked-rewards
                    , 'given-rewards := given-rewards
                    , 'whitelisted-accounts := whitelisted-accounts
                    , 'min-amount := min-amount
                    , 'max-amount := max-amount
                    }
      (let* (
             (valid-account:bool true)) ;;removed acc validation
        (enforce (>= (- total-rewards (+ locked-rewards given-rewards)) rewards)
                 "No rewards available for this lockup, try setting a lower amount.")
        (enforce (and (>= amount min-amount) (<= amount max-amount))
                 "Invalid lock amount")
        (enforce (or (contains account whitelisted-accounts) (>= (chain-time) start-time)) "Only Whitelisted accounts can enter before start-time")
        (enforce valid-account "Only k: accounts can participate")
        )))


  (defun lock:string
      (bond-id:string
       amount-time:integer
       amount-kda:decimal
       account:string)
    @doc "Locks a specified amount of KDA for a specified duration in a bond, earning potential rewards. Returns a confirmation message."
    (enforce-contract-unlocked)
    (let* (
           (option:object{lockup-option} (get-bond-lockup-option bond-id amount-time))
           (option-name:string (at 'option-name option))
           (curr-time:time (chain-time))
           (vp-multiplier:decimal (at 'polling-power-multiplier option))
           (vp:decimal (* amount-kda vp-multiplier))
           (safe-time:integer (at 'option-length option))
           (end-time:time (add-time curr-time safe-time))
           (rewards:decimal (calculate-max-rewards amount-kda safe-time bond-id))
           (lock-id:string (get-lockup-key bond-id account))
           (polls:integer (at 'total-polls (read-bond bond-id)))
           )


      (with-capability (LOCK bond-id account amount-kda rewards)
        (coin.transfer account (BONDER_BANK) amount-kda)

        (insert lockups lock-id
                {'bond-id: bond-id
                           , 'lockup-id: lock-id
                           , 'account: account
                           , 'lockup-option: option
                           , 'lockup-start-time: curr-time
                           , 'lockup-end-time: end-time
                           , 'kda-locked: amount-kda
                           , 'max-kda-rewards: rewards
                           , 'status: "locked"
                           , 'polls-at-lock: polls
                           , 'interactions: 0
                           , 'claimed-rewards: 0.0
                           , 'polling-power: vp})

        (with-read bond-sales bond-id
          {'locked-rewards:=locked-rewards , 'active-bonders:=active-bonders, 'total-vp:=total-vp }
          (update bond-sales bond-id
                  {'locked-rewards: (+ locked-rewards rewards), 'active-bonders: (+ active-bonders 1), 'total-vp: (+ vp total-vp)})
          )

        (with-default-read keys-table LOCKUP_KEY { 'lockups:[],  'bonds:[] } {'lockups:=lockups, 'bonds:= bonds}
                           (write keys-table LOCKUP_KEY {'bonds:[] , 'lockups:(+ lockups [lock-id])})
                           )

        (format "{} requested a KDA lockup returned over {}. Available from {}. {}"
                [account option-name (format-time "%c" end-time) lock-id]))))



  (defun can-account-bond:bool
      (bond-id:string
       account:string)
    @doc "Returns true if the account can create a lockup in the specified bond"
    (with-default-read lockups (get-lockup-key bond-id account)
      {'status: "claimed"}
      {'status := status}
      (= status "claimed")))


  (defun calculate-lockup-returns:decimal
      (bond-id:string
       account:string)
    @doc "Returns the total reward amount based on the locked amount, duration, and interactions."
    (let*
        (
         (lockup-key:string (get-lockup-key bond-id account))
         (lockup:object{lockup} (read-lockup lockup-key))
         (bond:object{bond-sale} (read-bond bond-id))
         (coef-denom (if (= (at 'total-polls bond) 0) 1 (- (at 'total-polls bond) (at 'polls-at-lock lockup))))
         (lockup-option:object{lockup-option} (at 'lockup-option lockup))
         (max-boost:decimal (at 'poller-max-boost lockup-option))
         (interactions:integer (get-account-lockup-interactions bond-id account))
         (amount:decimal (at 'kda-locked lockup))
         (total-polls:integer (at 'total-polls bond))
         (time-multiplier:decimal (at 'time-multiplier lockup-option))
         (base-apr:decimal (at 'base-apr bond))
         (coefficient:decimal (/ (dec interactions) (dec coef-denom)))
         (poller-boost:decimal (+ (* coefficient max-boost) (- 1.0 coefficient)))
         (returns:decimal (floor (* amount (* base-apr (* time-multiplier poller-boost))) (coin.precision)))
         )
      (enforce (and (<= 0.0 coefficient) (>= 1.0 coefficient)) (format "Something is wrong with the poller boost: {}" [coefficient]))
      (enforce (> returns 0.0) (format "The computed returns are {} :: This was computed as {}*{}*{}*({}*({}/{}))" [returns amount base-apr time-multiplier max-boost interactions total-polls]))
      (if (= coefficient 0.0) amount returns) ;; users should participate in governance to earn rewards
      )
    )


  (defcap CLAIM
      (bond-id:string
       account:string)
    "Claim KDA rewards from lockup event"
    @event
    (let (
          (lock-id:string (get-lockup-key bond-id account))
          )
      (with-read lockups lock-id
        { 'lockup-end-time := end-time
                           , 'status := status
                           }
        (enforce-guard (at 'guard (coin.details account)))
        (enforce (= status "locked") "You already claimed the rewards from this bond.")
        (enforce-guard (at-after-date end-time)))))


  (defun claim:string
      (bond-id:string
       account:string)
    @doc "Claims rewards for a specified bond and account, transferring earned KDA to the account. Returns a confirmation message."
    (enforce-contract-unlocked)
    (with-capability (CLAIM bond-id account)
      (let* (
             (bond:object{bond-sale} (read-bond bond-id))
             (locked-rewards:decimal (at 'locked-rewards bond))
             (given-rewards:decimal (at 'given-rewards bond))
             (total-vp: decimal (at 'total-vp bond))
             (lock-id:string (get-lockup-key bond-id account))
             (lockup:object{lockup} (read-lockup lock-id))
             (vp:decimal (at 'polling-power lockup))
             (max-rewards:decimal (at 'max-kda-rewards lockup))
             (original-amount:decimal (at 'kda-locked lockup))
             (total-amount:decimal (calculate-lockup-returns bond-id account))
             (lockup-rewards:decimal (- total-amount original-amount))
             (active-bonders:integer (at 'active-bonders bond))
             )

        ;; Payout KDA
        (with-capability (BANK_DEBIT)
          (install-capability (coin.TRANSFER (BONDER_BANK) account total-amount))
          (coin.transfer (BONDER_BANK) account total-amount))

        (update lockups lock-id
                { 'status: "claimed", 'claimed-rewards: lockup-rewards })

        (update bond-sales bond-id
                {'locked-rewards: (- locked-rewards max-rewards)
                                  , 'given-rewards: (+ given-rewards lockup-rewards)
                                  , 'active-bonders: (- active-bonders 1)
                                  , 'total-vp: (- total-vp vp)})


        (format "Account {} received KDA from bond {}" [account bond-id]))))


  (defun claim-back-rewards
      (bond-id:string account:string amount:decimal)
    @doc "Claims back available rewards for a specified bond, transferring earned KDA to the account. \
     \ Only the bond creator can perform this action. This action may end the available sales for the bond."
    (enforce-contract-unlocked)
    (with-read bond-sales bond-id
      { 'total-rewards := total-rewards
                       ,'locked-rewards := locked-rewards
                       ,'given-rewards := given-rewards
                       }
      (let* (
             (claimable-rewards:decimal (get-bond-available-rewards bond-id))
             )
        (enforce (<= amount claimable-rewards) (format "You can claim at most {} KDA back" [claimable-rewards]))
        (enforce (= (+ given-rewards claimable-rewards) (- total-rewards locked-rewards)) "Reward computation sanity check. Should always pass.")
        (with-capability (MANAGE_BOND_REWARDS bond-id account amount)
          (with-capability (BANK_DEBIT)
            (install-capability (coin.TRANSFER (BONDER_BANK) account claimable-rewards))
            (coin.transfer (BONDER_BANK) account claimable-rewards))
          (update bond-sales bond-id {'given-rewards: (+ given-rewards claimable-rewards)})
          )
        )
      )
    )

  (defun get-active-bonds:[object{bond-sale}] ()
         @doc "Retrieves all active bond IDs."
         (map (read-bond) (get-bond-keys)))

  (defun get-active-bond-ids:[string] ()
         @doc "Retrieves all active bond IDs."
         (map (at 'bond-id) (get-active-bonds)))


  ;;active-bond-keys -> user-bond-ids -> lockup-keys -> lockups
  (defun get-account-active-lockups:[object{lockup}]
    (account:string)
    @doc "Retrieves all active bonds associated with a specified account."

    (filter (lambda (x) (and (= "locked" (at 'status x)) (= account (at 'account x)))) (map (read-lockup) (get-lockup-keys))
            )
    )

  (defun get-account-lockups:[object{lockup}]
    (account:string)

    (filter (lambda (x) (= account (at 'account x))) (map (read-lockup) (get-lockup-keys))
            )
    )


  (defun get-bond-available-rewards:decimal
      (bond-id:string)
    @doc "Returns the available rewards from a specified bond."
    (with-read bond-sales bond-id
      {'total-rewards := total-rewards
                      , 'locked-rewards := locked-rewards
                      ,  'given-rewards:= given-rewards }
      (- total-rewards (+ locked-rewards given-rewards))
      )
    )

  (defun BOND_REWARDS-mgr:decimal
      (managed:decimal
       requested:decimal
       )
    (let ((newbal:decimal (- managed requested)))
      (enforce (>= newbal 0.0)
               (format "TRANSFER exceeded for balance {}" [managed]))
      newbal)
    )


  (defcap MANAGE_BOND_REWARDS (bond-id:string account:string amount:decimal)
    @managed amount BOND_REWARDS-mgr
    (compose-capability (ACCOUNT_GUARD account))
    (with-read bond-sales bond-id
      {
       'creator := creator
       }
      (enforce (= creator account) "Only the bond creator can add rewards")
      ))



  (defun add-bond-rewards (account:string bond-id:string amount:decimal)
    @doc "Adds extra rewards for a specified bond, transferring the amount to the bank. \
     \ Only the bond creator can perform this action. This action opens extra lockup spots for the bond."
    (enforce-contract-unlocked)
    (with-read bond-sales bond-id
      {'total-rewards := total-rewards}
      (with-capability (MANAGE_BOND_REWARDS bond-id account amount)
        (coin.transfer account (BONDER_BANK) amount)
        (update bond-sales bond-id {'total-rewards: (+ total-rewards amount)})
        )
      )
    )

  (defun is-core-account:bool
      (account:string)
    @doc "Check if an account has Core privilleges by checking if the account is stored in bond-creators table"
    (with-default-read bond-creators account
      {'is-active: false}
      {'is-active:= status}
      (= true status)
      )
    )

  (defun add-user-interaction (lockup-id:string)
    @doc "Increments the interaction count for a bonder and a specific bond. \
        \ Can only be called from the Poller contract."
    (enforce-contract-unlocked)
    (with-read lockups lockup-id {'interactions := i }
               (with-capability (PRIVILEGE_GUARD AGGREGATE_INTERACTION)
                 (update lockups lockup-id {'interactions: (+ i 1)})
                 )
               )

    )




  (defun add-new-poll (bond-id:string)
    @doc "Increments the total poll count for a specified bond. \
         \ Can only be called from the Poller contract."
    (enforce-contract-unlocked)
    (with-read bond-sales bond-id {'total-polls := i }
               (with-capability (PRIVILEGE_GUARD AGGREGATE_INTERACTION)
                 (update bond-sales bond-id {'total-polls: (+ i 1)})
                 )
               )

    )

  ;; Privileges aggregating interactions
  (defcap PRIVILEGE_GUARD (action:string)
    @doc "Capability for enforcing privilege guards."
    @event
    (enforce-privilege action))

  (defschema privilege
      @doc "Schema for defining privileges."
      guards:[guard]
      action:string)


  (defconst AGGREGATE_INTERACTION:string 'aggregate-interaction)
  ;;  (defconst INCLUDE_NEW_POLL:string 'include-poll)

  (deftable privilege-table:{privilege})

  (defun grant-privilege:string (g:guard action:string)
    @doc "This function grants a guard privilege to perform a specific action."
    (enforce-contract-unlocked)
    (with-capability (OPS)
      (with-default-read privilege-table action
        {'guards:[],'action:action}
        {'guards:=guards-read, 'action:=action-read}
        (write privilege-table action{
                                      'guards:(+ guards-read [g]),
                                      'action:action}))))

  (defun enforce-privilege:bool
      (action:string)
    @doc "Checks if a guard has privilege on a given action"
    (let ((privilege-granted:bool (check-privilege action)))
      (enforce privilege-granted (format "Could not obtain privilege on action {}" [action]))))


  (defun or-guard:bool
      ( a:bool
       b:guard)
    (or a (try false (enforce-guard b))))


  (defun check-privilege:bool (action:string)
    @doc "enforce-privilege utility function"
    (with-default-read privilege-table action
      { 'guards: []}
      { 'guards := guards}
      (fold (or-guard) false guards)))

  )

(if (read-msg 'upgrade)
    ["upgrade"]
    [(create-table bond-sales)
     (create-table lockups)
     (create-table bond-creators)
     (create-table privilege-table)
     (create-table keys-table)
     (create-table contract-lock)
     (init false)])
