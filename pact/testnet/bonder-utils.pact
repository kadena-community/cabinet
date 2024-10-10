(namespace (read-msg 'ns))
(module bonder-utils GOVERNANCE

  (use n_e611558dc9a9858b027d8c2e04bb431de8f7668c.bonder)

  ;; Capabilities
  (defcap GOVERNANCE ()
    (enforce-guard
     (keyset-ref-guard "n_e611558dc9a9858b027d8c2e04bb431de8f7668c.bonder-admin")))

  (defun get-account-active-bonds-ids:[string]
    (account:string)
    @doc "Returns current bonds an account is currently participating"
    (map (at 'bond-id) (get-account-active-bonds account))
    )

  (defun get-account-bonds:[object{lockup}]
    (account:string)
    @doc "Retrieves all bonds associated with a specified account."
    (select lockups (where 'account (= account))))

  (defun get-account-active-bonds:[object{lockup}]
    (account:string)
    @doc "Retrieves all active bonds associated with a specified account."
    (filter (where 'status (= "locked")) (get-account-bonds account))
    )

  (defun read-all-lockups-bond:[object{lockup}]
    (bond-id:string)
    @doc "Reads all lockups associated with a specified bond ID."
    (filter (where 'bond-id (= bond-id)) (read-all-lockups)))

  (defun read-all-lockups:[object{lockup}]
    ()
    @doc "Reads all lockups."
    (select lockups (constantly true)))

  (defun read-all-bonds:[object{bond-sale}] ()
         @doc "Get all bonds info"
         (map (read-bond) (get-bond-keys)))


  )
