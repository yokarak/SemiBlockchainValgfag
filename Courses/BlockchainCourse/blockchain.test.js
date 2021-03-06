const BlockChain = require('./blockchain');
const Block = require('./block');
const cryptoHash = require('./crypto-hash');

describe('BlockChain', () => {
    let blockChain, newChain, originalChain;
    beforeEach(() =>{ // dette gør så der er en ny, ikke ændret blockchain før hver test.
        blockChain = new BlockChain();
        newChain = new BlockChain();

        originalChain = blockChain.chain;
    })

    it('contains a chain array', () => {
        expect(blockChain.chain instanceof Array).toBe(true);
    });

    it('starts with the genesis block', () => {
        expect(blockChain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain', () => {
        const newData = 'foo bar';
        blockChain.addBlock({ data : newData });
        
        expect(blockChain.chain[blockChain.chain.length-1].data).toEqual(newData);
    });

    describe('isValideChain()', () => {
        describe('When the chain does not start with the genesis block', () =>{
            it('returns false', () => {
                blockChain.chain[0] = {data: 'fake-genesis'};

                expect(BlockChain.isValidChain(blockChain.chain)).toBe(false);
            })
        });

        describe('when the chain starts with the genesis block and has multiple blocks', () => {
            beforeEach( () => {
                blockChain.addBlock({data: 'Bears'});
                blockChain.addBlock({data: 'bees'});
                blockChain.addBlock({data: 'honey'});
            })

            describe('and a lastHash reference has changed', () => {
                it('returns false', () => {
                    blockChain.chain[2].lastHash = 'broken-lastHash';

                    expect(BlockChain.isValidChain(blockChain.chain)).toBe(false);
                })
            });

            describe('and the chain contains with an invalid field', () => {
                it('returns false', ()=>{
                    blockChain.chain[2].data = 'some-bad-and-evil-data';

                    expect(BlockChain.isValidChain(blockChain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with a jumped difficulty', () =>{
                it('returns false', () => {
                    const lastBlock = blockChain.chain[blockChain.chain.length-1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty-3;
                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
                    const badBLock = new Block({
                        timestamp, lastHash, hash, nonce, difficulty, data
                    });

                    blockChain.chain.push(badBLock);

                    expect(BlockChain.isValidChain(blockChain.chain)).toBe(false);
                });
            });

            describe('and the chain does not contain any invalid blocks', () => {
                it('returns true', () =>{
                    expect(BlockChain.isValidChain(blockChain.chain)).toBe(true);
                });
            });
        });

        describe('replaceCHain', () => {
            let errorMock, logMock;

            beforeEach(() =>{
                errorMock= jest.fn();
                logMock = jest.fn();

                global.console.error = errorMock;
                global.console.log = logMock;
            });

            describe('when the new chain is not longer', () => {
                beforeEach(() =>{
                    newChain.chain[0] = { new: 'chain'};

                    blockChain.replaceChain(newChain.chain);
                })
                it('does not replace the chain', () =>{
                    expect(blockChain.chain).toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('when the new chain is longer', () => {

                beforeEach(() => {
                    newChain.addBlock({data: 'Bears'});
                    newChain.addBlock({data: 'bees'});
                    newChain.addBlock({data: 'honey'});
                })
                
                describe('where the chain is invalid', () => {
                    beforeEach(()=>{
                        newChain.chain[2].hash = 'some-fake-hash'

                        blockChain.replaceChain(newChain.chain);
                    });
                    it('does not replace the chain', () =>{
                        expect(blockChain.chain).toEqual(originalChain);
                    });

                    it('logs an error', () => {
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

                describe('when the chain is valid', () => {
                    beforeEach(()=>{
                        blockChain.replaceChain(newChain.chain);
                    });

                    it('it replaces the chain', () =>{
                        expect(blockChain.chain).toEqual(newChain.chain);
                    });

                    it('logs about the chain replacement', () =>{
                        expect(logMock).toHaveBeenCalled();
                    });
                });
            });
        });

    });
});