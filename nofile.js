"use strict";

import kit from "nokit";

export default (task, option) => {

    option("-n, --name <examples/basic>", "example file name", "examples/basic");
    option("-g, --grep <.*>", "unit test regex filter", ".*");

    task("default", "run an example", (opts) => {
        kit.monitorApp({
            bin: "babel-node",
            args: [opts.name],
            watchList: ["examples/**/*.js", "src/**/*.js"]
        });
    });

    task("build-docs", ["clean"], "build readme.md", () => {
        return kit.warp("src/**/*.js")
        .load(
            kit.drives.comment2md({ h: 2, tpl: "doc/readme.jst.md" })
        ).run();
    });

    task("build", ["build-docs"], "build src from es6 to es5", () => {
        return kit.copy("src/**", "lib");
    });

    task("clean", "clean", () => {
        return kit.remove("lib");
    });

    task("watch-test", "run & watch test api", (opts) =>
        kit.spawn("junit", [
            "-g", opts.grep,
            "-w", "{src,test}/**/*.js",
            "test/*.js"
        ])
    );

    task("lint", "lint all code of this project", () => {
        function lint (f) {
            f.set(null);
            return kit.spawn("eslint", [f.path]);
        }

        return kit.warp("{examples,src,test}/**/*.js").load(lint).run();
    });

    task("test", ["lint"], "run test once", (opts) =>
        kit.spawn("junit", [
            "-g", opts.grep,
            "test/*.js"
        ])
    );

    task("benchmark", "run benchmark", () => {
        process.env.NODE_ENV = "production";
        var paths = kit.globSync("benchmark/basic/*.js");
        var port = 3120;
        console.log(`Node ${process.version}`);
        console.log(`The less the better:`);
        return kit.flow(paths.reverse().map((path) => {
            return async () => {
                var p = port++;
                var name = kit.path.basename(path, ".js");
                var child = kit.spawn("node", [path, p]).process;
                await kit.spawn("node", ["benchmark/index.js", p, name]);
                child.kill();
            };
        }))();
    });
};
