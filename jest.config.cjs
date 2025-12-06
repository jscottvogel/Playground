/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/__mocks__/fileMock.js',
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {

                target: 'ES2022',
                lib: ['ES2022', 'DOM', 'DOM.Iterable'],
                module: 'commonjs',
                moduleResolution: 'node',
                jsx: 'react-jsx',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                types: ["vite/client", "jest", "@testing-library/jest-dom"],
                skipLibCheck: true
            }
        }]
    },
};
