(namespace 'free)
(use dab.bonder)
(module cab-migrate G

  (defcap G() (enforce-guard (keyset-ref-guard "dab.bonder-admin")))

  (defun migrate-lockup-option:object{lockup-option}(option:object)
         (let ((new-option:object{lockup-option} {
                                                  'option-name: (at 'option-name option)
                                                  , 'option-length: (floor (at 'option-length option))
                                                  , 'time-multiplier: (at 'time-multiplier option)
                                                  , 'poller-max-boost: (at 'poller-max-boost option)
                                                  , 'polling-power-multiplier: (at 'polling-power-multiplier option)

                                                  }))
           new-option
           ))

  (defun migrate-lockup:object (lockup:object)
    (let ((new-option:object{lockup-option} (migrate-lockup-option (at 'lockup-option lockup))))
      new-option
      ))

  (defun migrate-bond:[object] (bond:object)
         (let ((new-options:[object{lockup-option}] ( map (migrate-lockup-option) (at 'lockup-options bond))))
           new-options
           ))

  (defun write-new-bond (bond-id:string)
    (let ((bond (read-bond bond-id)))
      (update bond-sales bond-id {'lockup-options: (migrate-bond bond)})
      ))

  (defun write-new-lockup (lockup-id:string)
    (let ((lockup (read-lockup lockup-id)))
      (update lockups lockup-id {'lockup-option: (migrate-lockup lockup)})
      ))
  )
[
                                        ;(write bond-keys BOND_KEY {'bonds: (read-msg 'all-bonds)})
 (map (write-new-lockup) (read-msg 'all-lockups))
 (map (write-new-bond) (read-msg 'all-bonds))
 ]
;;(write bond-sales (migrate-bond bond))
;;(write lockups (lock-id) {'lockup-option: {'option-length}})
