// computers.js – Lua Computer Mod for Sandboxels
// Designed to load from a raw GitHub URL

var modName = "mods/computers.js";

function registerLuaComputer() {
    if (typeof elements === "undefined") {
        // wait until Sandboxels has initialized
        requestAnimationFrame(registerLuaComputer);
        return;
    }

    if (elements.luacomputer) return; // already registered

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
        desc: "A programmable Lua computer. Right-click to edit.",

        tick: function(pixel) {
            if (pixel.running) return;

            if (typeof fengari === "undefined") {
                pixel.output = "Fengari (Lua VM) not loaded!";
                pixel.running = true;
                return;
            }

            try {
                const luaCode = pixel.code || "";
                const L = fengari.L,
                      lua = fengari.lua,
                      lauxlib = fengari.lauxlib,
                      lualib = fengari.lualib,
                      to_luastring = fengari.to_luastring;

                const luaState = lauxlib.luaL_newstate();
                lualib.luaL_openlibs(luaState);

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
}

// register element after Sandboxels loads
registerLuaComputer();
