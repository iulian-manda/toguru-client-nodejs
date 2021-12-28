import { ToguruData } from '../../src/models/toguru'
import { convertRawToguruDataToToguruData } from '../../src/services/fetchToguruData'

export const toguruData: ToguruData = convertRawToguruDataToToguruData({
    sequenceNo: 4141,
    toggles: [
        {
            id: 'with-empty-activation',
            tags: {
                team: 'team1',
            },
            activations: [{}],
        },
        {
            id: 'rolled-out-to-everyone',
            tags: {
                team: 'team2',
            },
            activations: [
                {
                    attributes: {},
                    rollout: {
                        percentage: 100,
                    },
                },
            ],
        },
        {
            id: 'rolled-out-to-half-of-users',
            tags: {
                team: 'team3',
            },
            activations: [
                {
                    attributes: {},
                    rollout: {
                        percentage: 50,
                    },
                },
            ],
        },
        {
            id: 'rolled-out-only-in-de',
            tags: {
                team: 'team4',
            },
            activations: [
                {
                    attributes: {
                        culture: ['de-DE', 'DE'],
                    },
                    rollout: {
                        percentage: 100,
                    },
                },
            ],
        },
        {
            id: 'rolled-out-only-in-it',
            tags: {
                team: 'team4',
            },
            activations: [
                {
                    attributes: {
                        culture: ['it-IT', 'IT'],
                    },
                    rollout: {
                        percentage: 100,
                    },
                },
            ],
        },
        {
            id: 'rolled-out-to-none-not-even-in-de',
            tags: {
                team: 'team5',
                stack: 'stack1',
                services: 'service1',
            },
            activations: [
                {
                    attributes: {
                        culture: ['de-DE', 'DE'],
                    },
                },
            ],
        },
        {
            id: 'rolled-out-to-half-in-de-only',
            tags: {
                team: 'team6',
                stack: 'stack2',
                services: 'service3,service2',
            },
            activations: [
                {
                    attributes: {
                        culture: ['de-DE'],
                    },
                    rollout: {
                        percentage: 50,
                    },
                },
            ],
        },
        {
            id: 'rolled-out-to-none',
            tags: {
                team: 'team7',
                service: 'service2',
            },
            activations: [
                {
                    attributes: {},
                    rollout: {
                        percentage: 0,
                    },
                },
            ],
        },
        {
            id: 'rolled-out-to-99-percent',
            tags: {},
            activations: [
                {
                    attributes: {},
                    rollout: {
                        percentage: 99,
                    },
                },
            ],
        },
        {
            id: 'rolled-out-to-user123-in-de',
            tags: {},
            activations: [
                {
                    attributes: {
                        culture: ['de-DE'],
                        user: ['user123'],
                    },
                    rollout: {
                        percentage: 100,
                    },
                },
            ],
        },
        {
            id: 'rolled-out-to-76-percent',
            tags: {},
            activations: [
                {
                    attributes: {},
                    rollout: {
                        percentage: 76,
                    },
                },
            ],
        },
        {
            id: 'rolled-out-to-75-percent',
            tags: {},
            activations: [
                {
                    attributes: {},
                    rollout: {
                        percentage: 75,
                    },
                },
            ],
        },
    ],
})
