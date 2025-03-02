import { Transaction, SystemProgram, Connection, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction, PublicKey } from "@solana/web3.js"
import wallet from "./dev-wallet.json"

// Import our dev wallet keypair from the wallet file
const from = Keypair.fromSecretKey(new Uint8Array(wallet));

// Defining WBA public key
const to = new PublicKey('6v72Cc2RiqauHpBXntv42GLZr3Hw1WJb9c3GpRaLbV5B');

//Create Solana devnet connection
const connection = new Connection('https://api.devnet.solana.com');

(async () => {
    try {
        // Get balance of Dev wallet
        const balance = await connection.getBalance(from.publicKey)
        //creating a test transaction to calculate fees
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: from.publicKey,
                toPubkey: to,
                lamports: balance,
            })
        );
        //Set the recent blockhash for the transaction
        transaction.recentBlockhash = ((await connection.getLatestBlockhash('confirmed')).blockhash)

        // Set the fee payer for the transaction
        transaction.feePayer = from.publicKey

        //Getting gas fee
        const fee = (await connection.getFeeForMessage(transaction.compileMessage(), 'confirmed')).value || 0

        // Remove our transfer instruction to replace it
        transaction.instructions.pop();

        transaction.add(
            SystemProgram.transfer({
                fromPubkey: from.publicKey,
                toPubkey: to,
                lamports: balance - fee,
            })
        )

        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        )
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${signature}?cluster=devnet`)
    } catch (error) {
        console.error(`Oops, something went wrong: ${error}`)
    }
})()