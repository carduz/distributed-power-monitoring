/**
 * Created by claudio on 08/01/17.
 */
"use strict";
module.exports = class {

    constructor(name, handlerParameters, setupParameters) {
        this.name = name;
        this.handlerParameters = handlerParameters || [];
        this.setupParameters = setupParameters || [];
    }
};