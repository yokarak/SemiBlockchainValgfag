const Block = require("./block");
const { GENESIS_DATA, MINE_RATE } = require('./config');
const cryptoHash = require('./crypto-hash');

describe('Block', () => {
    const timestamp = 2000;
    const lastHash = 'foo-lastHash';
    const data = ['blockchain', 'data'];
    const hash = 'foo-hash';
    const nonce = 1;
    const difficulty = 1;

    const block = new Block({timestamp, lastHash, data, hash, nonce, difficulty})

    it('has a timestamp, lastHash, data, hash property, nonce and difficulty', () =>{
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });

    describe('Genesis()', () =>{
        const genesisBlock = Block.genesis();

        it('return a block instance', ()=>{
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('return the genesisdata', () =>{
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mineBlock()', ()=> {
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const minedBlock = Block.mineBlock({lastBlock, data});

        it('returns a Block instance', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('sets the `lastHash´ to the ´hash´ of the lastBlock', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets the ´data´', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets the ´timestamp´', () =>{
            expect(minedBlock.timestamp).not.toEqual(undefined); 
        })

        it('creates a sha-256 ´hash´ based on the proper inputs', () => {
            expect(minedBlock.hash)
            .toEqual(
                cryptoHash(
                    minedBlock.timestamp, 
                    minedBlock.nonce, 
                    minedBlock.difficulty, 
                    lastBlock.hash, 
                    data
                )
            );
        });

        it('sets a ´hash´ that matches the dificulty criteria', () =>{
            expect(minedBlock.hash.substring(0, minedBlock.difficulty))
            .toEqual('0'.repeat(minedBlock.difficulty));
        });


    });

    describe('adjustDifficulty', () => {
        it('raises the difficulty for a quickly mined block', () =>{
            expect(Block.adjustDifficulty({ 
                orignalBlock: block, timestamp: block.timestamp + MINE_RATE - 100
             })).toEqual(block.difficulty + 1);
        });
        
        it('lowers the difficulty for a slowly mined block', () =>{
            expect(Block.adjustDifficulty({
                orignalBlock: block, timestamp: block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficulty -1 );
        });
    
    });
});