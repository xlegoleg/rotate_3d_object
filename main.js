"use strict";

(function main() {
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        alert('Can`t get context');
        return;
    }

    const program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const colorLocation = gl.getAttribLocation(program, "a_color");
    const matrixLocation = gl.getUniformLocation(program, "u_matrix");

    let m4 = {

        projection: function(width, height, depth) {
            return [
                2 / width, 0, 0, 0,
                0, -2 / height, 0, 0,
                0, 0, 2 / depth, 0,
                -1, 1, 0, 1,
            ];
        },

        multiply: function(a, b) {
            let a00 = a[0 * 4 + 0];
            let a01 = a[0 * 4 + 1];
            let a02 = a[0 * 4 + 2];
            let a03 = a[0 * 4 + 3];
            let a10 = a[1 * 4 + 0];
            let a11 = a[1 * 4 + 1];
            let a12 = a[1 * 4 + 2];
            let a13 = a[1 * 4 + 3];
            let a20 = a[2 * 4 + 0];
            let a21 = a[2 * 4 + 1];
            let a22 = a[2 * 4 + 2];
            let a23 = a[2 * 4 + 3];
            let a30 = a[3 * 4 + 0];
            let a31 = a[3 * 4 + 1];
            let a32 = a[3 * 4 + 2];
            let a33 = a[3 * 4 + 3];
            let b00 = b[0 * 4 + 0];
            let b01 = b[0 * 4 + 1];
            let b02 = b[0 * 4 + 2];
            let b03 = b[0 * 4 + 3];
            let b10 = b[1 * 4 + 0];
            let b11 = b[1 * 4 + 1];
            let b12 = b[1 * 4 + 2];
            let b13 = b[1 * 4 + 3];
            let b20 = b[2 * 4 + 0];
            let b21 = b[2 * 4 + 1];
            let b22 = b[2 * 4 + 2];
            let b23 = b[2 * 4 + 3];
            let b30 = b[3 * 4 + 0];
            let b31 = b[3 * 4 + 1];
            let b32 = b[3 * 4 + 2];
            let b33 = b[3 * 4 + 3];
            return [
                b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
                b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
                b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
                b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
                b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
                b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
                b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
                b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
                b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
                b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
                b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
                b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
                b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
                b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
                b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
                b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
            ];
        },

        translation: function(tx, ty, tz) {
            return [
                1,  0,  0,  0,
                0,  1,  0,  0,
                0,  0,  1,  0,
                tx, ty, tz, 1,
            ];
        },

        xRotation: function(angleInRadians) {
            const c = Math.cos(angleInRadians);
            const s = Math.sin(angleInRadians);

            return [
                1, 0, 0, 0,
                0, c, s, 0,
                0, -s, c, 0,
                0, 0, 0, 1,
            ];
        },

        yRotation: function(angleInRadians) {
            const c = Math.cos(angleInRadians);
            const s = Math.sin(angleInRadians);

            return [
                c, 0, -s, 0,
                0, 1, 0, 0,
                s, 0, c, 0,
                0, 0, 0, 1,
            ];
        },

        zRotation: function(angleInRadians) {
            const c = Math.cos(angleInRadians);
            const s = Math.sin(angleInRadians);

            return [
                c, s, 0, 0,
                -s, c, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ];
        },

        scaling: function(sx, sy, sz) {
            return [
                sx, 0,  0,  0,
                0, sy,  0,  0,
                0,  0, sz,  0,
                0,  0,  0,  1,
            ];
        },

        translate: function(m, tx, ty, tz) {
            return m4.multiply(m, m4.translation(tx, ty, tz));
        },

        xRotate: function(m, angleInRadians) {
            return m4.multiply(m, m4.xRotation(angleInRadians));
        },

        yRotate: function(m, angleInRadians) {
            return m4.multiply(m, m4.yRotation(angleInRadians));
        },

        zRotate: function(m, angleInRadians) {
            return m4.multiply(m, m4.zRotation(angleInRadians));
        },

        scale: function(m, sx, sy, sz) {
            return m4.multiply(m, m4.scaling(sx, sy, sz));
        },

    };

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setGeometry(gl);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    setColors(gl);

    function radToDeg(r) {
        return r * 180 / Math.PI;
    }

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    const translation = [150, 150, 0];
    const rotation = [degToRad(0), degToRad(0), degToRad(0)];
    const scale = [1, 1, 1];

    drawScene();

    webglLessonsUI.setupSlider("#angleX", {value: radToDeg(rotation[0]), slide: updateRotation(0), max: 360});
    webglLessonsUI.setupSlider("#angleY", {value: radToDeg(rotation[1]), slide: updateRotation(1), max: 360});
    webglLessonsUI.setupSlider("#angleZ", {value: radToDeg(rotation[2]), slide: updateRotation(2), max: 360});

    function updateRotation(index) {
        return function(event, ui) {
            var angleInDegrees = ui.value;
            var angleInRadians = angleInDegrees * Math.PI / 180;
            rotation[index] = angleInRadians;
            drawScene();
        };
    }

    /**
     * Ф-ия отрисовки
     */
    function drawScene() {
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.useProgram(program);
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        let size_p = 3;
        let type_p = gl.FLOAT;
        let normalize_p = false;
        let stride_p = 0;
        let offset_p = 0;
        gl.vertexAttribPointer(
            positionLocation, size_p, type_p, normalize_p, stride_p, offset_p);

        gl.enableVertexAttribArray(colorLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

        let size_c = 3;
        let type_c = gl.UNSIGNED_BYTE;
        let normalize_c = true;
        let stride_c = 0;
        let offset_c = 0;
        gl.vertexAttribPointer(
            colorLocation, size_c, type_c, normalize_c, stride_c, offset_c);

        let matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
        matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
        matrix = m4.xRotate(matrix, rotation[0]);
        matrix = m4.yRotate(matrix, rotation[1]);
        matrix = m4.zRotate(matrix, rotation[2]);
        matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

        gl.uniformMatrix4fv(matrixLocation, false, matrix);

        let primitiveType = gl.TRIANGLES;
        let offset = 0;
        let count = 16 * 6;
        gl.drawArrays(primitiveType, offset, count);
    }

    /**
     * Ф-ия задания координат фигуры
     * @param gl {Object}
     */
    function setGeometry(gl) {
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                // Передняя грань
                -50, -50, -50,
                50, -50, -50,
                -50, -50, 50,

                50, -50, 50,
                -50, -50, 50,
                50, -50, -50,

                // Задняя грань
                -50, 50, -50,
                -50, 50, 50,
                50, 50, -50,

                50, 50, 50,
                50, 50, -50,
                -50, 50, 50,

                // Нижняя грань
                -50, -50, -50,
                -50, 50, -50,
                50, -50, -50,

                50, 50, -50,
                50, -50, -50,
                -50, 50, -50,

                // Верхняя грань
                -50, -50, 50,
                50, -50, 50,
                -50, 50, 50,

                50, 50, 50,
                -50, 50, 50,
                50, -50, 50,

                // Левая грань
                -50, -50, -50,
                -50, -50, 50,
                -50, 50, -50,

                -50, 50, 50,
                -50, 50, -50,
                -50, -50, 50,

                // Правая грань
                50, -50, -50,
                50, 50, -50,
                50, -50, 50,

                50, 50, 50,
                50, -50, 50,
                50, 50, -50
            ]),
            gl.STATIC_DRAW);
    }
    /**
     * Ф-ия покраски фигуры
     * @param gl {Object}
     */
    function setColors(gl) {
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                // Передняя грань
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,

                200,  70, 120,
                200,  70, 120,
                200,  70, 120,

                // Задняя грань
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,

                80, 70, 200,
                80, 70, 200,
                80, 70, 200,

                // Нижняя грань
                76, 210, 100,
                76, 210, 100,
                76, 210, 100,

                76, 210, 100,
                76, 210, 100,
                76, 210, 100,

                // Верхняя грань
                100, 70, 210,
                100, 70, 210,
                100, 70, 210,

                100, 70, 210,
                100, 70, 210,
                100, 70, 210,

                // Левая грань
                140, 210, 80,
                140, 210, 80,
                140, 210, 80,

                140, 210, 80,
                140, 210, 80,
                140, 210, 80,

                // Правая грань
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,

                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
            ]),
            gl.STATIC_DRAW);
    }
})();
