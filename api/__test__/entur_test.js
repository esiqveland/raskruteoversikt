import EnturService from '@entur/sdk';
import {VariableType} from 'json-to-graphql-query'

const moment = require('moment');
const fetch = require('isomorphic-fetch');


describe('Entur API', function () {
    it('should return features', function (done) {
        const service = new EnturService({
            clientName: 'raskrute',
        });

        service.getFeatures('Jernbanetorget')
            .then(stops => stops.filter(stop => stop.properties.id.indexOf('StopPlace') > -1))
            .then(features => {
                //console.log('features=%O', features);
                expect(features.length).toBeGreaterThan(1);
                done();
            })
            .catch(done);
    });

    it('should return stop departures by id', function (done) {
        const service = new EnturService({
            clientName: 'raskrute',
        });

        // service.getStopPlaceDepartures('NSR:StopPlace:58163')
        //     .then(deps => {
        //         console.log('getStopPlaceDepartures=%O', deps);
        //         done();
        //     })
        //     .catch(done);

        // const jernbanetorget = 'NSR:StopPlace:58366';
        // service.getStopPlaceDepartures(jernbanetorget)
        //     .then(deps => {
        //         console.log('getStopPlaceDepartures=%O', deps);
        //         done();
        //     })
        //     .catch(done);
    });

    it('should return stop by id', function (done) {
        const service = new EnturService({
            clientName: 'raskrute',
        });

        const loren = 'NSR:StopPlace:58163';

        const stopPlaceQuery = {
            query: {
                __variables: {
                    id: 'String!'
                },
                stopPlace: {
                    __args: {
                        id: new VariableType('id'),
                    },
                    id: true,
                    name: true,
                    latitude: true,
                    longitude: true,
                    transportMode: true,
                    quays: {
                        id: true,
                        name: true,
                        estimatedCalls: {
                            aimedDepartureTime: true,
                            expectedDepartureTime: true,
                            destinationDisplay: {
                                frontText: true,
                            },
                            serviceJourney: {
                                id: true,
                                line: {
                                    publicCode: true,
                                    name: true,
                                    notices: {
                                        id: true,
                                        text: true,
                                        publicCode: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        service.journeyPlannerQuery(stopPlaceQuery, {id: loren})
            .then(res => res.data)
            .then(res => res.stopPlace)
            .then(stopplace => {
                console.log('getStopPlace=%O', stopplace);
                stopplace.quays.map(val => val.estimatedCalls).forEach(call => {
                    console.log('call=%O', call);
                });
                done();
            })
            .catch(done);

        // service.getStopPlace(løren)
        //     .then(stopplace => {
        //         console.log('getStopPlace=%O', stopplace);
        //         done();
        //     })
        //     .catch(done);

        // service.getStopPlace('NSR:StopPlace:58366')
        //     .then(stopplace => {
        //         console.log('getStopPlace=%O', stopplace);
        //         done();
        //     })
        //     .catch(done);
    });

    it('should return a stop with known ID', function (done) {
        const service = new EnturService({
            clientName: 'raskrute',
        });

        service.getFeatures('Løren')
            .then(stops => {
                console.log('stops=%O', stops);
                done();
            })
            .catch(done);
    });
});
