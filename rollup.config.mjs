import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const isWatch = process.env.ROLLUP_WATCH;

// Only include renderer in watch mode
const configs = isWatch ? ['renderer'] : ['main', 'preload', 'renderer'];

export default configs.map(target => {
    if (target === 'main') {
        return {
            input: 'src/main.ts',
            output: {
                dir: 'dist',
                format: 'esm',
                sourcemap: true
            },
            external: [
                'electron',
                'path',
                'url',
                'fs'
            ],
            plugins: [
                typescript({
                    tsconfig: './tsconfig.main.json',
                    sourceMap: true
                }),
                nodeResolve({
                    exportConditions: ['node'],
                    preferBuiltins: true,
                }),
                commonjs(),
                copy({
                    targets: [
                        { src: 'src/public/*', dest: 'dist/public' }
                    ]
                })
            ]
        };
    }

    if (target === 'preload') {
        return {
            input: 'src/preload.ts',
            output: {
                file: 'dist/preload.js',
                format: 'cjs',
                sourcemap: true
            },
            external: ['electron'],
            plugins: [
                typescript({
                    tsconfig: './tsconfig.preload.json',
                    sourceMap: true
                }),
                nodeResolve({
                    exportConditions: ['node'],
                    preferBuiltins: true,
                }),
                commonjs()
            ]
        };
    }

    if (target === 'renderer') {
        return {
            input: 'src/renderer.tsx',
            output: {
                dir: 'dist/public',
                format: 'esm',
                sourcemap: true,
                preserveModules: true,
                preserveModulesRoot: 'src'
            },
            plugins: [
                typescript({
                    tsconfig: './tsconfig.renderer.json',
                    sourceMap: true
                }),
                nodeResolve({
                    browser: true
                }),
                commonjs(),
                replace({
                    preventAssignment: true,
                    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
                }),
                postcss(),
                isWatch && serve({
                    open: false,
                    verbose: true,
                    contentBase: 'dist/public',
                    host: 'localhost',
                    port: 3000,
                }),
                isWatch && livereload({
                    watch: 'dist/public'
                })
            ].filter(Boolean)
        };
    }
}); 