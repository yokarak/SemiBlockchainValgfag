const Block = require('./block');
const cryptoHash = require('./crypto-hash');

class BlockChain {
    constructor(){
        this.chain = [Block.genesis()]
    }

    addBlock({ data }) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length-1],
            data
        });

        this.chain.push(newBlock);
    }

    replaceChain(chain) {
        if(chain.length <= this.chain.length) {
            console.error('The incomming chain must be longer')
            return;
        }

        if(!BlockChain.isValidChain(chain)) {
            console.error('The incomming chain must be valid')
            return;
        }

        console.log('Replacing chain with', chain);
        this.chain = chain;
    }

    static isValidChain( chain) {
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

        for(let i=1; i<chain.length; i++) {
            const { timestamp, lastHash, hash,  nonce, difficulty, data} = chain[i];
            const actualLastHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;

            if(lastHash !== actualLastHash) return false;

            if(Math.abs(lastDifficulty - difficulty) >1 ) return false;            
            
            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

            if( hash !== validatedHash) return false;
        }
        return true;
    }

}


module.exports = BlockChain;