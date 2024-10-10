export interface MessageToSign {
  address: string;
  chainId: number;
  network: string;
  domain: string;
  expirationTime: Date;
  notBefore: Date;
  timeout: number;
  statement: string;
  nonce: string;
  uri: string;
}

export interface LoginRequest {
  signedTx: {
    cmd: string;
    hash: string;
    sigs: [
      {
        sig: string;
      }
    ];
  };
}

export interface LoginResponse {
  hasErrors: boolean;
  jsonString: string;
}
