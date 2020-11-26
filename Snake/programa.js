window.addEventListener("load", main);
window.addEventListener("resize", resize);
//window.addEventListener("mousemove", mover);
window.addEventListener("keydown", andar);

// VARIÁVEIS GLOBAIS
let canvas, // área de desenho
  gl, // API do WebGL
  frame = 0, // número do frame atual
  vertexSrc, // codigo fonte vertex shader
  fragmentSrc, // codigo fonte fragment shader
  vertexShader, // shader compilado
  fragmentShader, // shader compilado
  shaderProgram, // programa com shaders linkados
  data, // modelo 3D
  positionAttr, // referência do buffer no shader de fragmento
  positionBuffer, // buffer alocado
  normalAttr, // referência do buffer no shader de fragmento
  normalBuffer, // buffer alocado
  frameUniform, // variável de frame nos shaders
  width,
  height,
  aspect,
  projection,
  projectionUniform,
  model,
  fruta,
  frutaModel,
  modelUniform,
  view,
  viewUniform,
  px = 0,
  pz = 0,
  dir = 0;

var snake = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
];

var direcao = [0, 2];

async function main(evt) {
  // 1 - Criar uma área de desenho
  canvas = createCanvas();

  // 2 - Carregar a API do WebGL (OpenGL)
  gl = loadGL();

  // 3 - Carregar os arquivos fonte de shader (GLSL)
  vertexSrc = await fetch("vertex.glsl").then((r) => r.text());
  fragmentSrc = await fetch("fragment.glsl").then((r) => r.text());

  console.log("VERTEX:", vertexSrc);
  console.log("FRAGMENT:", fragmentSrc);

  // 4 - Compilar os shaders
  vertexShader = compile(vertexSrc, gl.VERTEX_SHADER);
  fragmentShader = compile(fragmentSrc, gl.FRAGMENT_SHADER);

  // 5 - Linkar os shaders
  shaderProgram = link(vertexShader, fragmentShader);
  gl.useProgram(shaderProgram);

  // 6 - Criar os dados de modelo
  data = getData();

  // 7 - Transferir dados de modelo para GPU

  // POSITION
  positionAttr = gl.getAttribLocation(shaderProgram, "position");
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, data.points, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttr);
  gl.vertexAttribPointer(positionAttr, 3, gl.FLOAT, false, 0, 0);

  // NORMAL
  normalAttr = gl.getAttribLocation(shaderProgram, "normal");
  normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, data.normais, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalAttr);
  gl.vertexAttribPointer(normalAttr, 3, gl.FLOAT, false, 0, 0);

  // 7.5 - Recalcula o tamanho da tela
  resize();

  // 8 - Uniforms...
  // 8.1 - Model
  modelUniform = gl.getUniformLocation(shaderProgram, "model");

  model = mat4.fromTranslation([], [1, -3, 0]);
  fruta = [10, 10];
  frutaModel = mat4.fromTranslation([], [fruta[0], fruta[1], 0]);

  gl.uniformMatrix4fv(modelUniform, false, new Float32Array(model));

  // 8.2 - View
  view = mat4.lookAt([], [-2.5, 3, 50], [0.0, 0.0, 0.0], [0, -1, 0]);
  viewUniform = gl.getUniformLocation(shaderProgram, "view");
  gl.uniformMatrix4fv(viewUniform, false, new Float32Array(view));

  // 8.3 - Projection
  projection = mat4.perspective([], 0.3 * Math.PI, aspect, 0.01, 100);
  projectionUniform = gl.getUniformLocation(shaderProgram, "projection");
  gl.uniformMatrix4fv(projectionUniform, false, new Float32Array(projection));

  frameUniform = gl.getUniformLocation(shaderProgram, "frame");

  // 9 - Chamar o loop de redesenho
  render();
}

function render() {
  // 9.1 - Atualizar dados
  gl.uniform1f(frameUniform, frame);

  // 9.2 - Limpar a tela
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 9.3 - Desenhar
  // POINTS, LINES, LINE_STRIP, TRIANGLES
  movimento();
  for (let i = 0; i < data.partes.length; i++) {
    gl.uniformMatrix4fv(modelUniform, false, data.partes[i].getModel(snake[i]));
    gl.drawArrays(gl.TRIANGLES, 0, data.points.length / 3);
  }
  gl.uniformMatrix4fv(modelUniform, false, new Float32Array(frutaModel));
  gl.drawArrays(gl.TRIANGLES, 0, data.points.length / 3);

  // 9.4 - Encerrar frame de desenho
  frame++;
  requestAnimationFrame(render);
}

function getData() {
  let n = [
    // frente
    [0, 0, -1],
    // topo
    [0, -1, 0],
    // esquerda
    [-1, 0, 0],
    // direita
    [1, 0, 0],
    // baixo
    [0, 1, 0],
    // fundo
    [0, 0, 1],
  ];

  let normais = [
    ...n[0],
    ...n[0],
    ...n[0],
    ...n[0],
    ...n[0],
    ...n[0],

    ...n[1],
    ...n[1],
    ...n[1],
    ...n[1],
    ...n[1],
    ...n[1],

    ...n[2],
    ...n[2],
    ...n[2],
    ...n[2],
    ...n[2],
    ...n[2],

    ...n[3],
    ...n[3],
    ...n[3],
    ...n[3],
    ...n[3],
    ...n[3],

    ...n[4],
    ...n[4],
    ...n[4],
    ...n[4],
    ...n[4],
    ...n[4],

    ...n[5],
    ...n[5],
    ...n[5],
    ...n[5],
    ...n[5],
    ...n[5],
  ];
  let s = 0.9;

  let v = [
    // 0: A - EQ TP FR
    [-1 * s, -1 * s, -1 * s],
    // 1: B - DR TP FR
    [1 * s, -1 * s, -1 * s],
    // 2: C - DR BX FR
    [1 * s, 1 * s, -1 * s],
    // 3: D - EQ BX FR
    [-1 * s, 1 * s, -1 * s],
    // 4: E - EQ TP TZ
    [-1 * s, -1 * s, 1 * s],
    // 5: F - DR TP TZ
    [1 * s, -1 * s, 1 * s],
    // 6: G - EQ BX TZ
    [-1 * s, 1 * s, 1 * s],
    // 7: H - DR BX TZ
    [1 * s, 1 * s, 1 * s],
  ];

  let points = [
    // frente
    // adc
    ...v[0],
    ...v[3],
    ...v[2],
    // cba
    ...v[2],
    ...v[1],
    ...v[0],

    // topo
    // abe
    ...v[0],
    ...v[1],
    ...v[4],
    // bfe
    ...v[1],
    ...v[5],
    ...v[4],

    // esquerda
    // dae
    ...v[3],
    ...v[0],
    ...v[4],
    // gde
    ...v[6],
    ...v[3],
    ...v[4],

    // direita
    // bch
    ...v[1],
    ...v[2],
    ...v[7],
    // hfb
    ...v[7],
    ...v[5],
    ...v[1],

    // baixo
    // dgh
    ...v[3],
    ...v[6],
    ...v[7],
    // hcd
    ...v[7],
    ...v[2],
    ...v[3],

    // fundo
    // fhg
    ...v[5],
    ...v[7],
    ...v[6],
    // gef
    ...v[6],
    ...v[4],
    ...v[5],
  ];

  let p0 = new Parte([0, -5, 0]);
  p0.model = mat4.rotateZ([], p0.model, Math.PI / 2);
  let p1 = new Parte([0, 2, 0], p0);
  let p2 = new Parte([0, 2, 0], p1);
  let p3 = new Parte([2, 2, 0], p1);

  let modelo = {
    points: new Float32Array(points),
    normais: new Float32Array(normais),
    partes: [p0, p1, p2, p3],
  };

  return modelo;
}

function createCanvas() {
  let canvas = document.createElement("canvas");
  canvas.style.background = "hsl(0deg, 0%, 80%)";
  document.body.appendChild(canvas);
  return canvas;
}

function loadGL() {
  let gl = canvas.getContext("webgl");
  gl.enable(gl.DEPTH_TEST);
  return gl;
}

function compile(source, type) {
  let shader = gl.createShader(type);
  let typeInfo = type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT";
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    let reason = gl.getShaderInfoLog(shader);
    console.error("ERRO NA COMPILAÇÃO ::", type, reason);
    return null;
  }
  console.info("SHADER COMPILADO :: ", typeInfo);
  return shader;
}

function link(vertexShader, fragmentShader) {
  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("ERRO NO LINK");
    return null;
  }
  console.info("LINKAGEM BEM SUCEDIDA!!!");
  return program;
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  aspect = width / height;
  if (canvas) {
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
  }
  if (gl) gl.viewport(0, 0, canvas.width, canvas.height);

  if (projectionUniform) {
    projection = mat4.perspective([], 0.3 * Math.PI, aspect, 0.01, 100);
    gl.uniformMatrix4fv(projectionUniform, false, new Float32Array(projection));
  }
}

function mover(evt) {
  const DES = 13;
  /// -1 < x < 1
  let x = (evt.x / window.innerWidth) * 2 - 1;
  let y = (evt.y / window.innerHeight) * -2 + 1;

  let dx = x * DES;
  let dy = y * DES;

  if (view) {
    view = mat4.lookAt([], [dx, dy, 10], [0.0, 0.0, 0.0], [0, -1, 0]);
    gl.uniformMatrix4fv(viewUniform, false, new Float32Array(view));
  }
}

function andar(evt) {
  if (evt.key == "w" && direcao[1] == 0) return (direcao = [0, -2]);
  if (evt.key == "s" && direcao[1] == 0) return (direcao = [0, 2]);
  if (evt.key == "a" && direcao[0] == 0) return (direcao = [2, 0]);
  if (evt.key == "d" && direcao[0] == 0) return (direcao = [-2, 0]);
}

function movimento() {
  if (frame % 20 != 0) return;
  //corpo
  for (let i = snake.length - 1; i > 0; i--) {
    snake[i] = snake[i - 1];
    snake[i] = colisaoParede(snake[i]);
  }
  snake[0] = colisaoParede(snake[0]);
  //cabeca
  snake[0] = [
    snake[0][0] + direcao[0], //x
    snake[0][1] + direcao[1], //y
  ];

  console.log(frame);
  colision();
  SelfColide();
}

function crescer() {
  snake.push([...snake[snake.length - 1]]);
  console.log(snake.length);
  data.partes.push(
    new Parte([
      snake[snake.length - 1][0],
      snake[snake.length - 1][1],
      snake[snake.length - 1][2],
    ])
  );
}

function colision() {
  if (snake[0][0] == fruta[0] && snake[0][1] == fruta[1]) {
    fruta = moveFruta();
    crescer();
    frutaModel = mat4.fromTranslation([], [fruta[0], fruta[1], 0]);
  }
}

function SelfColide() {
  for (var i = 1; i < snake.length; i++) {
    if (snake[0][0] == snake[i][0] && snake[0][1] == snake[i][1]) {
      window.alert("Morreu");
      location.reload();
    }
  }
}

function moveFruta() {
  var x = Math.random() * 50 - 50 / 2;
  x = Math.floor(x / 2) * 2;
  var y = Math.random() * 50 - 50 / 2;
  y = Math.floor(y / 2) * 2;

  if (snake.some((col) => col[0] == x && col[1] == y)) return moveFruta();
  return [x, y];
}

function colisaoParede(p) {
  let x = p[0];
  let y = p[1];
  if (p[0] > 25) x = -24;
  if (p[0] < -25) x = 24;

  if (p[1] > 25) y = -24;
  if (p[1] < -25) y = 24;

  return [x, y];
}
