var textarea,
    svg,
    message,
    save,
    download,
    variables = {
        names: ['width', 'height', 'centerX', 'centerY'],
    },
    defaults = {
        canvasWidth: 256,
        canvasHeight: 256,
        gridSize: 16,
        strokeWidth: 8,
        strokeLineCap: 'square',
        fill: 'none',
        radius: 32
    },
    settings = {
        canvasWidth: 256,
        canvasHeight: 256,
        gridSize: 16,
        strokeWidth: 8,
        strokeLineCap: 'square',
        fill: 'none',
        radius: 32
    };
var shape = {
    point: function (x, y) {
        x = value(x);
        y = value(y);
        return [x, y];
    },
    line: function (point1, point2) {
        point1 = value(point1);
        point2 = value(point2);

        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.element.setAttributeNS(null, 'x1', point1[0] * settings.gridSize);
        this.element.setAttributeNS(null, 'y1', point1[1] * settings.gridSize);
        this.element.setAttributeNS(null, 'x2', point2[0] * settings.gridSize);
        this.element.setAttributeNS(null, 'y2', point2[1] * settings.gridSize);
        this.element.setAttributeNS(null, 'stroke-width', settings.strokeWidth);
        this.element.setAttributeNS(null, 'stroke', 'black');
        this.element.setAttributeNS(null, 'stroke-linecap', settings.strokeLineCap);
        svg.appendChild(this.element);
    },
    circle: function (point, radius, fill, stroke) {
        point = value(point);
        radius = value(radius);

        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.element.setAttributeNS(null, 'cx', point[0] * settings.gridSize);
        this.element.setAttributeNS(null, 'cy', point[1] * settings.gridSize);
        this.element.setAttributeNS(null, 'r', radius * settings.gridSize);
        this.element.setAttributeNS(null, 'fill', settings.fill);
        this.element.setAttributeNS(null, 'stroke-width', settings.strokeWidth);
        this.element.setAttributeNS(null, 'stroke', 'black');
        svg.appendChild(this.element);
    },
    arc: function (point1, point2, curve) {
        point1 = value(point1);
        point2 = value(point2);

        distance = Math.sqrt(
            Math.pow((point1[0] - point2[0]), 2) +
            Math.pow((point1[1] - point2[1]), 2)) * settings.gridSize;

        curve = (isNaN(curve)) ? distance / 2 : value(curve) * settings.gridSize;
        if(curve > distance/2) {
            error('Arc curve is too high.');
        }
        radius = (((distance / 2) * (distance / 2)) + (curve * curve)) / (2 * curve);
        console.log('distance = ' + distance + ' radius = ' + radius);

        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        var string = 'M ' + point1[0] * settings.gridSize + ' ' + point1[1] * settings.gridSize + ' A ' + radius + ' ' + radius + ' 0 0 1 ' + point2[0] * settings.gridSize + ' ' + point2[1] * settings.gridSize;

        console.log(string)
        this.element.setAttributeNS(null, 'd', string);
        this.element.setAttributeNS(null, 'fill', settings.fill);
        this.element.setAttributeNS(null, 'stroke-width', settings.strokeWidth);
        this.element.setAttributeNS(null, 'stroke', 'black');
        this.element.setAttributeNS(null, 'stroke-linecap', settings.strokeLineCap);
        svg.appendChild(this.element);
    }
}

window.onload = function () {
    textarea = document.getElementsByTagName('textarea')[0];
    textarea.onkeyup = textChange;
    textarea.value = (localStorage.getItem('text') === null) ? '' : localStorage.getItem('text');
    svg = document.getElementsByTagName('svg')[0];
    message = document.getElementById('message');
    download = document.getElementById('download');
    download.onclick = function () {
        this.href = "data:text/xml;charset=utf-8," + document.getElementById('svg').innerHTML;
        this.download = 'exact-image.svg';
    };
    save = document.getElementById('save');
    save.onclick = function () {
        this.href = "data:text/plain," + textarea.value.split('\n').join('%0D%0A');
        this.download = 'exact-draw.txt';
    }

    draw();
    //shape.arc([128, 16], [128, 240]);
}

function textChange(event) {
    localStorage.setItem('text', textarea.value);
    switch (event.keyCode) {
        //Enter
        case 13:
            draw();
            break;
        //Space
        case 32:
            draw();
            break;
    }
}

function value(value) {
    // console.log(value);
    if (Array.isArray(value)) {
        for (var index = 0; index < value.length; index++) {
            for (var i = 0; i < variables.names.length; i++) {
                if (String(value[index]).indexOf(variables.names[i]) !== -1) {
                    value[index] = value[index].split(variables.names[i]).join('variables.' + variables.names[i]);
                }
            }
            value[index] = eval(value[index]);
        }
    } else if (typeof value == 'string') {
        for (var i = 0; i < variables.names.length; i++) {
            value = value.split(variables.names[i]).join('variables.' + variables.names[i]);
        }
        eval('try { value = ' + value + ';} catch(err) { value = 0; error(\'\"' + value + '\" is not defined.\'); }');
    }
    return value;
}

function error(string) {
    message.innerHTML += string + "</br>";
}

function draw() {
    //Clean
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }
    svg.style.width = settings.canvasWidth;
    svg.style.height = settings.canvasHeight;
    var svgWidth = svg.getBoundingClientRect().width;
    var svgHeight = svg.getBoundingClientRect().width;
    variables = {
        names: ['width', 'height', 'centerX', 'centerY'],
        width: svgWidth / settings.gridSize,
        height: svgHeight / settings.gridSize,
        centerX: (svgWidth / settings.gridSize) / 2,
        centerY: (svgHeight / settings.gridSize) / 2
    };
    settings.fill = defaults.fill;
    var parent = message.parentNode;
    message.innerHTML = '';
    parent.removeChild(message);
    parent.appendChild(message);

    var rows = textarea.value.split('\n');
    rows.forEach(function (element) {
        var values = element.split(' ');

        //Add variables
        for (var index = 1; index < values.length; index++) {
            //Remove empty spaces
            if (!values[index]) {
                values.splice(index, 1);
            }
        }

        switch (values[0].toLowerCase()) {
            case 'var':
                switch (values.length) {
                    //Var Name Value
                    case 3:
                        variables.names.push(values[1]);
                        eval('variables.' + values[1] + '=' + values[2]);
                        break;
                    default:
                        error(element);
                        break;
                }
                break;
            case 'point':
                switch (values.length) {
                    case 3:
                        //Point Name Point
                        if (Array.isArray(values[2])) {
                            variables.names.push(values[1]);
                        } else {
                            error(values[2]);
                        }
                        break;
                    case 4:
                        //Point Name X Y
                        variables.names.push(values[1]);
                        eval('variables.' + values[1] + '=[' + shape.point(values[2], values[3]) + ']');
                        break;
                }
                break;
            case 'line':
                switch (values.length) {
                    case 3:
                        //LINE Point1 Point2
                        if (Array.isArray(value(values[1])) && Array.isArray(value(values[2]))) {
                            shape.line(values[1], values[2]);
                        } else {
                            error(element);
                        }
                        break;
                    case 5:
                        //LINE X1 Y1 X2 Y2
                        shape.line([values[1], values[2]], [values[3], values[4]]);
                        break;
                }
                break;
            case 'circle':
                //Default values = Circle center center 32
                switch (values.length) {
                    case 3:
                        //CIRCLE Point Radius
                        if (Array.isArray(value(values[1]))) {
                            shape.circle(values[1], values[2]);
                        } else {
                            error(element);
                        }
                        break;
                    case 4:
                        //CIRCLE X Y Radius
                        shape.circle([values[1], values[2]], values[3]);
                        break;
                }
                break;
            case 'arc':
                switch (values.length) {
                    case 4:
                        //ARC Point1 Point2
                        if (Array.isArray(value(values[1]))) {
                            shape.arc(values[1], values[2], values[3]);
                        } else {
                            error(element);
                        }
                        break;
                    case 5:
                        //ARC X1 Y1 X2 Y2
                        shape.arc([values[1], values[2]], [values[3], values[4]]);
                        break;
                    case 6:
                        //ARC X1 Y1 X2 Y2
                        shape.arc([values[1], values[2]], [values[3], values[4]], values[5]);
                        break;
                }
                break;
            case 'stroke':
                switch (values.length) {
                    case 2:
                        //STROKE Width
                        settings.strokeWidth = value(values[1]);
                        break;
                }
                break;
            case 'fill':
                switch (values.length) {
                    case 2:
                        //FILL Color
                        settings.fill = values[1];
                        break;
                }
                break;
            default:
                error(values);
                break;
        }

    }, this);
}