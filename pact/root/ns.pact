;;Functions for creating namespace util and its admin and users.
(define-keyset 'util-ns-users)
(define-keyset 'util-ns-admin)

(define-namespace 'util
    (keyset-ref-guard 'util-ns-users)
  (keyset-ref-guard 'util-ns-admin))
