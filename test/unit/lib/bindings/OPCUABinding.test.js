const rewire = require('rewire');
const { expect, assert } = require('chai');
const opcua = require('node-opcua');
const mockConfig = require('../../../../conf/config-v2.example');
const mockDevice = require('../../mock/device.mock.json');

describe('OPCUABinding handling', () => {
    const opcuaBinding = rewire('../../../../lib/bindings/OPCUABinding.js');
    const mockConfig = require('../../../../conf/config-v2.example');

    describe('readValueFromOPCUANode', () => {
        describe('When the_session is not null', () => {
            beforeEach(() => {
                opcuaBinding.__set__('config.getConfig', () => {
                    return mockConfig;
                });
                opcuaBinding.__set__('the_session', {
                    readVariableValue: () => {
                        return {
                            value: {
                                value: 0
                            }
                        };
                    }
                });
            });

            it('Should read value from OPCUANode', async () => {
                const opcuaNodeId = 'ns=3;s=Acceleration';
                const result = await opcuaBinding.readValueFromOPCUANode(opcuaNodeId);
                expect(result).to.equal(0);
            });
        });

        describe('When dataValue is null', () => {
            beforeEach(() => {
                opcuaBinding.__set__('config.getConfig', () => {
                    return mockConfig;
                });
                opcuaBinding.__set__('the_session', {
                    readVariableValue: () => {
                        return {
                            value: null
                        };
                    }
                });
            });

            it('Should read value from OPCUANode', async () => {
                const opcuaNodeId = 'ns=3;s=Acceleration';
                const result = await opcuaBinding.readValueFromOPCUANode(opcuaNodeId);
                expect(result).to.equal(null);
            });
        });

        describe('When the_session is null', () => {
            beforeEach(() => {
                opcuaBinding.__set__('config.getConfig', () => {
                    return mockConfig;
                });
                opcuaBinding.__set__('the_session', null);
            });

            it('Should read value from OPCUANode', async () => {
                const opcuaNodeId = 'ns=3;s=Acceleration';
                const result = await opcuaBinding.readValueFromOPCUANode(opcuaNodeId);
                expect(result).to.equal(null);
            });
        });
    });

    describe('executeQuery', () => {
        const mockDevice = require('../../mock/device.mock.json');

        describe('When the_session is not null', () => {
            beforeEach(() => {
                opcuaBinding.__set__('config.getConfig', () => {
                    return mockConfig;
                });
                opcuaBinding.__set__('the_session', {
                    readVariableValue: () => {
                        return {
                            value: {
                                value: 0
                            }
                        };
                    }
                });
            });

            it('Should execute a query', async () => {
                const apiKey = mockConfig.defaultKey;
                const device = mockDevice;
                const attribute = 'Speed';
                const result = await opcuaBinding.executeQuery(apiKey, device, attribute);
                expect(result[attribute].value).to.equal(0);
            });
        });
    });

    describe('executeCommand', () => {
        const mockDevice = require('../../mock/device.mock.json');

        describe('When the_session is not null', () => {
            beforeEach(() => {
                opcuaBinding.__set__('config.getConfig', () => {
                    return mockConfig;
                });
                opcuaBinding.__set__('the_session', {
                    readVariableValue: () => {
                        return {
                            value: {
                                value: 0
                            }
                        };
                    },
                    call: () => {}
                });
            });

            it('Should execute a command without input arguments', (done) => {
                const apiKey = mockConfig.defaultKey;
                const device = mockDevice;
                const attribute = {
                    name: 'Accelerate'
                };
                opcuaBinding.executeCommand(apiKey, device, attribute);
                done();
            });

            it('Should execute a command with single argument', (done) => {
                const apiKey = mockConfig.defaultKey;
                const device = mockDevice;
                const attribute = {
                    name: 'Accelerate',
                    value: '10'
                };
                opcuaBinding.executeCommand(apiKey, device, attribute);
                done();
            });
            it('Should execute a command with multiple arguments', (done) => {
                const apiKey = mockConfig.defaultKey;
                const device = mockDevice;
                const attribute = {
                    name: 'Accelerate',
                    value: '[10,10]'
                };
                opcuaBinding.executeCommand(apiKey, device, attribute);
                done();
            });
            it('Should execute a command with invalid input argument', (done) => {
                const apiKey = mockConfig.defaultKey;
                const device = mockDevice;
                const attribute = {
                    name: 'Accelerate',
                    value: { attr: 0 }
                };
                opcuaBinding.executeCommand(apiKey, device, attribute);
                done();
            });
        });
    });

    describe('start', () => {
        describe('When the_session is not null', () => {
            const opcuaNodeId = 'ns=3;s=Acceleration';
            beforeEach(() => {
                opcuaBinding.__set__('config.getConfig', () => {
                    return mockConfig;
                });
                opcuaBinding.__set__('the_session', {
                    readVariableValue: () => {
                        return {
                            value: {
                                value: 0
                            }
                        };
                    },
                    call: () => {}
                });
                opcuaBinding.__set__('opcua.OPCUAClient.create', (opcUAClientOptions) => {
                    var client = {
                        connect: () => {},
                        disconnect: () => {},
                        on: (type, on_callback) => {
                            on_callback();
                            return client;
                        },
                        createSession: () => {
                            return {
                                readVariableValue: () => {
                                    return {
                                        value: {
                                            value: 0
                                        }
                                    };
                                },
                                call: () => {},
                                createSubscription2: () => {
                                    var subscription = {
                                        on: (type, on_callback) => {
                                            on_callback();
                                            return subscription;
                                        },
                                        monitor: (itemToMonitor, monitoringParamaters, timestampToReturn) => {
                                            return {
                                                on: (type, on_callback) => {
                                                    on_callback({
                                                        statusCode: 0,
                                                        value: {
                                                            value: 0
                                                        }
                                                    });
                                                }
                                            };
                                        }
                                    };
                                    return subscription;
                                },
                                browse: () => {
                                    return [
                                        {
                                            statusCode: opcua.StatusCodes.Good
                                        }
                                    ];
                                }
                            };
                        }
                    };
                    return client;
                });
                opcuaBinding.__set__('metaBindings.performAutoProvisioning', () => {});
                opcuaBinding.__set__('opcua.resolveNodeId', (opcua_id) => {
                    return opcuaNodeId;
                });
                opcuaBinding.__set__(' commonBindings.opcuaMessageHandler', (id, mapping, value, sourceTimestamp) => {});
            });

            it('Should execute a query', async () => {
                await opcuaBinding.start();
            });
        });
    });
});
