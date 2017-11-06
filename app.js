$(document).ready(function () {

	var scriptsactivos = 0;

	var texto = "Don't worry! Because every little thing is gonna be alright... Don't worry!";

	var caracter = new Array();

	var errores = 0;

	for (var c = 0; c < texto.length; c++) {
		caracter[c] = texto.substring(c, c + 1);
		if (caracter[c] == "\n") {
			$('#ta').append("<span><br></span>");
		} else {
			$('#ta').append("<span>" + caracter[c] + "</span>");
		}
	}

	//array bidimensional que guarda en dedotecla[x][0] el dedo a usar, y en dedotecla[x][1] las teclas correspondientes a ese dedo
	var dedotecla = [["meñique izquierdo", "1!qaáz"], ["anular izquierdo", "2\"@wsx"], ["medio izquierdo", "3#eédc"], ["índice izquierdo", "4$5%rfvtgb"], ["pulgar derecho", " "], ["meñique derecho", "0='?¡¿pñ-_"], ["anular derecho", "9)oól.:"], ["medio derecho", "8(iík,;"], ["índice derecho", "7/uújmyhn"]];

	//guarda el caracter de la tecla recién presionada
	var tecla = "";

	//guarda la posición de la letra que fue tipeada recientemente
	var contador = 0;

	var dedocorrecto = "";

	$(document).keypress(function (event) {
		if (scriptsactivos === 0) {
			return 0;
		}
		
		var ew = event.which;
		console.log("event.which = " + ew);

		//caracter de tecla recién presionada
		tecla = String.fromCharCode(ew);
		console.log("caracter = " + tecla);

		//keyCode de la tecla recién presionada
		var kc = event.keyCode;
		console.log("keycode = " + kc);
		
		/* ignorar ciertas teclas:
		 * se deshabilita la activación de quick search en firefox con comilla simple (ew == 39)
		 * se deshabilita tabulador (kc == 9)
		 * */
		if (ew == 39 || kc == 9) {
			event.preventDefault();
		}

		//se llama a dedocorresp para que muestre el siguiente dedo a usar
		dedocorresp(contador);

		if (tecla == caracter[contador]) { //si la tecla presionada es la correcta (si corresponde al caracter actual), se pinta en verde y se avanza 1 caracter
			$("#ta").children('span').eq(contador).css("color", "rgb(10,200,10)");
			contador = contador + 1;
		} else if (event.keyCode == 8) { //si la tecla presionada es retroceso, se retrocede 1 caracter y se pinta ese caracter de negro nuevamente
			event.preventDefault();

			//si el fondo era celeste se quita el color
			if ($("#ta").children('span').eq(contador).css("background-color") == "rgb(180, 230, 255)" || $("#ta").children('span').eq(contador).css("background-color") == "#b4e6ff") {
				$("#ta").children('span').eq(contador).css("background-color", "transparent");
			}

			contador = contador - 1;
			$("#ta").children('span').eq(contador).css("background-color", "transparent");
			$("#ta").children('span').eq(contador).css("color", "black");
		} else {
			//si la tecla presionada no es la correcta y tampoco es backspace, se avanza 1 caracter, se cuenta 1 error más y se pinta ese caracter de rojo
			$("#ta").children('span').eq(contador).css("background-color", "rgb(255, 100, 100)");
			contador = contador + 1;

			errores = errores + 1;
			$("#divcanterrores").text(String(errores));
		}

		//si el color de la letra anterior es celeste, quitarle el color
		if ($("#ta").children('span').eq(contador - 1).css("background-color") == "rgb(180, 230, 255)" || $("#ta").children('span').eq(contador - 1).css("background-color") == "#b4e6ff") {
			$("#ta").children('span').eq(contador - 1).css("background-color", "transparent");
		}

		//colocar el color celeste a la letra actual
		$("#ta").children('span').eq(contador).css("background-color", "rgb(180, 230, 255)");

		calcularVelocidad(contador, texto);

		//se termina si se escribió hasta la última letra
		if (contador == texto.length) {

			scriptsactivos = 0;

			//$("#boton-calificar").fadeIn();
			$("#divvelocidad").fadeIn();

		}

	})

	function dedocorresp(x) {

		if (scriptsactivos === 0) {
			return 0;
		}

		//x es la posicion del caracter del texto a tipear actual, si x+1 es mayor a la longitud de "caracter" entonces no hace nada
		if ((x + 1) >= caracter.length) {
			return;
		}

		//letras guarda las letras correspondientes al dedo actual
		var letras = "";
		var dedotemp = "";
		dedocorrecto = "";

		//guardar el siguiente caracter del texto a tipear, para mostrar el dedo que le corresponderá
		var caracterAComparar = caracter[x + 1].toLowerCase();

		for (var i = 0; i <= 8; i++) {

			//letras que se revisaron en busca de coincidencia
			letras = String(dedotecla[i][1]);

			//dedo sobre el que se buscará coincidencia en sus caracteres
			dedotemp = dedotecla[i][0];

			dedocorrecto = "";

			//se empieza a recorrer letras, buscando la coincidencia en el dedo actual
			for (var cont = 0; cont < letras.length; cont++) {

				if (letras.substring(cont, cont + 1) == caracterAComparar) {

					dedocorrecto = dedotemp;
					$("#dedocorrespondiente").text(String(dedocorrecto));

					// se encontró la coincidencia, salir de los bucles
					cont = letras.length;
					i = 9;

				}//fin if

			}//fin for cont

		}//fin for i

	}//fin dedocorresp

	//bandera para que una sola vez se pueda poner el color azul al primer caracter
	//(al presionar espacio se volvía a activar este botón)
	var bandera = 0;

	$("#boton-comenzar").click(function () {

		scriptsactivos = 1;

		//se llama a dedocorresp con -1 para que imprima el dedo correspondiente a la primera letra
		if (bandera == 0) {
			bandera = 1;
			$("#ta").children('span').eq(0).css("background-color", "rgb(180,230,255)");
			dedocorresp(-1);
		}

	});
	
	$("#boton-calificar").click(function () {
		$("#divvelocidad").fadeIn();
	});

	$("#boton-reiniciar").click(function () {

		window.location.reload();

	});


	// inicio control de velocidad

	var ultimoTiempo = 0;
	var tiempo = 0;
	var total = 0;
	var teclacont = 0;

	function calcularVelocidad(x, texto) {

		/*if (scriptsactivos === 0) {
			return 0;
		}*/

		tiempo = new Date().getTime();

		if (ultimoTiempo != 0) {
			teclacont++;
			total += tiempo - ultimoTiempo;
			palabras = texto.substr(0, x).split(/\s/).length;
			$('#CPM').val(Math.round(teclacont / total * 60000, 2));
			$('#PPM').val(Math.round(palabras / total * 60000, 2));
		}

		ultimoTiempo = tiempo;

	}

	// fin control de velocidad

});

