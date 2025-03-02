import { Connection, Keypair, PublicKey } from "@solana/web3.js"
import { Program, Wallet, AnchorProvider } from "@coral-xyz/anchor"
import { IDL, WbaPrereq } from "./program/wba_pra_req"
import base58 from "bs58"
import wallet from "./wba-wallet.json"
//converting the private key string to base58
const walletbase58 = base58.decode(wallet);
//getting the keypair
const keypair = Keypair.fromSecretKey(new Uint8Array(walletbase58));
//establishing the connection
const connection = new Connection('https://api.devnet.solana.com');
//Github account
const github = Buffer.from("CHAKRADHAR98", "utf-8");

const provider = new AnchorProvider(connection, new Wallet(keypair))

const program = new Program<WbaPrereq>(IDL, provider);

// creating the PDA of our enrollment account

const enrollment_seeds = [Buffer.from("prereq"), keypair.publicKey.toBuffer()];
const [enrollment_key, _bump] = PublicKey.findProgramAddressSync(enrollment_seeds, program.programId);

(async () => {
    try {
        const txHash = await program.methods
            .complete(github)
            .accounts({
                signer: keypair.publicKey
            })
            .signers([
                keypair
            ]).rpc()
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

    } catch (error) {
        console.error(error)
    }
})()