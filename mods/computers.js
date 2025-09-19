var modName = "mods/computers.js";

    elements.luacomputer = {
        name: "Lua Computer",
        color: "#3333BB",
        behavior: behaviors.WALL,
        category: "machines",
        state: "solid",
        conduct: 1,
        properties: {
            code: "-- Lua code here\nprint(\"Hello from Lua!\")",
            output: "",
            running: false
        },
        desc: "A programmable computer that runs Lua code. Right-click to edit.",
        
        tick: function(pixel) {
            if (pixel.running) return;

            try {
                const luaCode = pixel.code || "";
                
                const L = fengari.L;
                const lua = fengari.lua;
                const lauxlib = fengari.lauxlib;
                const lualib = fengari.lualib;
                const to_luastring = fengari.to_luastring;

                // new Lua state
                const luaState = lauxlib.luaL_newstate();
                lualib.luaL_openlibs(luaState);

                // load and run code
                const status = lauxlib.luaL_loadstring(luaState, to_luastring(luaCode));
                if (status !== lua.LUA_OK) {
                    const msg = lua.lua_tojsstring(luaState, -1);
                    pixel.output = "Lua syntax error: " + msg;
                } else {
                    const callStatus = lua.lua_pcall(luaState, 0, lua.LUA_MULTRET, 0);
                    if (callStatus !== lua.LUA_OK) {
                        const errmsg = lua.lua_tojsstring(luaState, -1);
                        pixel.output = "Runtime error: " + errmsg;
                    } else {
                        const ret = lua.lua_tojsstring(luaState, -1);
                        pixel.output = ret || "(no return value)";
                    }
                }
            } catch (e) {
                pixel.output = "JS error: " + e.message;
            }

            pixel.running = true;
        }
    };

    // Right-click editor
    if (typeof editPixel === "function") {
        const oldEdit = editPixel;
        editPixel = function(pixel) {
            if (pixel.element === "luacomputer") {
                const newCode = prompt("Enter Lua code:", pixel.code);
                if (newCode !== null) {
                    pixel.code = newCode;
                    pixel.running = false;
                }
            } else {
                oldEdit(pixel);
            }
        };
    }

