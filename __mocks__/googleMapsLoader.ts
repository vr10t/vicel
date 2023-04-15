
export const Loader = jest.fn().mockImplementation(() => ({

    // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
    constructor(apiKey: string, version: string, libraries: string[]) { },

    // eslint-disable-next-line class-methods-use-this
    load(): Promise<any> {
        return Promise.resolve({
            maps: {
                LatLng: jest.fn().mockImplementation(() => ({
                    lat: () => 1,
                    lng: () => 1,
                })),
                LatLngBounds: jest.fn().mockImplementation(() => ({
                    extend: jest.fn(),
                })),
                places: {
                    Autocomplete: jest.fn().mockImplementation(() => ({
                        addListener: jest.fn(),
                    })),
                },
            },
        });
    }
} ));
