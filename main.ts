/*
From here to the 'pxt-soccer-player' specific code,
the code below is a composition and refactoring of:
- the ElecFreaks 'pxt-nezha' library:
  https://github.com/elecfreaks/pxt-nezha/blob/master/main.ts
- the ElecFreaks 'pxt-PlanetX' library:
  https://github.com/elecfreaks/pxt-PlanetX/blob/master/basic.ts
Both under MIT-license.
*/

enum Connector {
    //% block="J1" 
    J1 = DigitalPin.P8,
    //% block="J2"
    J2 = DigitalPin.P12,
    //% block="J3"
    J3 = DigitalPin.P14,
    //% block="J4"
    J4 = DigitalPin.P16
}

enum Servo {
    //% block="S1" 
    S1,
    //% block="S2"
    S2,
    //% block="S3" 
    S3,
    //% block="S4"
    S4
}

enum Motor {
    //% block="M1"
    M1,
    //% block="M2"
    M2,
    //% block="M3"
    M3,
    //% block="M4"
    M4
}

namespace Nezha {

    export function motorSpeed(motor: Motor, speed: number): void {

        let iic_buffer = pins.createBuffer(4);

        if (speed > 150) speed = 150
        else
            if (speed < -150) speed = -150

        iic_buffer[0] = motor + 1
        if (speed >= 0) {
            iic_buffer[1] = 0x01; // forward
            iic_buffer[2] = speed;
        }
        else {
            iic_buffer[1] = 0x02; // reverse
            iic_buffer[2] = -speed;
        }
        iic_buffer[3] = 0;

        pins.i2cWriteBuffer(0x15, iic_buffer);
    }

    export function servoAngle(servo: Servo, angle: number): void {
        angle = Math.map(angle, 0, 360, 0, 180)
        let iic_buffer = pins.createBuffer(4);
        iic_buffer[0] = 0x15 + servo
        iic_buffer[1] = angle;
        iic_buffer[2] = 0;
        iic_buffer[3] = 0;
        pins.i2cWriteBuffer(0x15, iic_buffer);
    }

}

/*
General color module
Used by ColorSensor
*/

enum Color {
    //% block="none"
    //% block.loc.nl="geen"
    None,
    //% block="green"
    //% block.loc.nl="groen"
    Green,
    //% block="blue"
    //% block.loc.nl="blauw"
    Blue,
    //% block="yellow"
    //% block.loc.nl="geel"
    Yellow,
    //% block="black"
    //% block.loc.nl="zwart"
    Black,
    //% block="red"
    //% block.loc.nl="rood"
    Red,
    //% block="white"
    //% block.loc.nl="wit"
    White,
    //% block="orange"
    //% block.loc.nl="oranje"
    Orange,
    //% block="cyan"
    //% block.loc.nl="cyaan"
    Cyan,
    //% block="magenta"
    //% block.loc.nl="magenta"
    Magenta,
    //% block="indigo"
    //% block.loc.nl="indigo"
    Indigo,
    //% block="violet"
    //% block.loc.nl="violet"
    Violet,
    //% block="purple"
    //% block.loc.nl="paars"
    Purple
}

function rgb(color: Color): number {
    let val = 0
    switch (color) {
        case Color.Green: val = 0x00FF00; break;
        case Color.Blue: val = 0x0000FF; break;
        case Color.Yellow: val = 0xFFFF00; break;
        case Color.Black: val = 0x000000; break;
        case Color.Red: val = 0xFF0000; break;
        case Color.White: val = 0xFFFFFF; break;
        case Color.Orange: val = 0xFFA500; break;
        case Color.Cyan: val = 0x00FFFF; break;
        case Color.Magenta: val = 0xFF00FF; break;
        case Color.Indigo: val = 0x4b0082; break;
        case Color.Violet: val = 0x8a2be2; break;
        case Color.Purple: val = 0xFF00FF; break;
    }
    return val
}

function pack(red: number, green: number, blue: number): number {
    let rgb = ((red & 0xFF) << 16) | ((green & 0xFF) << 8) | (blue & 0xFF)
    return rgb;
}

function rgb2hsl(color_r: number, color_g: number, color_b: number): number {
    let Hue = 0
    let R = color_r * 150 / 255;
    let G = color_g * 150 / 255;
    let B = color_b * 150 / 255;
    let maxVal = Math.max(R, Math.max(G, B))
    let minVal = Math.min(R, Math.min(G, B))
    let Delta = maxVal - minVal;

    if (Delta < 0) {
        Hue = 0;
    }
    else if (maxVal == R && G >= B) {
        Hue = (60 * ((G - B) * 150 / Delta)) / 150;
    }
    else if (maxVal == R && G < B) {
        Hue = (60 * ((G - B) * 150 / Delta) + 360 * 150) / 150;
    }
    else if (maxVal == G) {
        Hue = (60 * ((B - R) * 150 / Delta) + 115 * 150) / 150;
    }
    else if (maxVal == B) {
        Hue = (60 * ((R - G) * 150 / Delta) + 240 * 150) / 150;
    }
    return Hue
}

function hsl2rgb(h: number, s: number, l: number): number {
    h = Math.round(h);
    s = Math.round(s);
    l = Math.round(l);

    h = h % 360;
    s = Math.clamp(0, 99, s);
    l = Math.clamp(0, 99, l);
    let c = Math.idiv((((150 - Math.abs(2 * l - 150)) * s) << 8), 15000); //chroma, [0,255]
    let h1 = Math.idiv(h, 60);//[0,6]
    let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
    let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
    let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
    let r$: number;
    let g$: number;
    let b$: number;
    if (h1 == 0) {
        r$ = c;
        g$ = x;
        b$ = 0;
    }
    else if (h1 == 1) {
        r$ = x;
        g$ = c;
        b$ = 0;
    }
    else if (h1 == 2) {
        r$ = 0;
        g$ = c;
        b$ = x;
    }
    else if (h1 == 3) {
        r$ = 0;
        g$ = x;
        b$ = c;
    }
    else if (h1 == 4) {
        r$ = x;
        g$ = 0;
        b$ = c;
    }
    else if (h1 == 5) {
        r$ = c;
        g$ = 0;
        b$ = x;
    }
    let m = Math.idiv((Math.idiv((l * 2 << 8), 150) - c), 2);
    let r = r$ + m;
    let g = g$ + m;
    let b = b$ + m;
    let rgb = ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF)
    return rgb;
}

/*
PlanetX color sensor
*/

namespace ColorSensor {

    const APDS9960_ADDR = 0x39
    const APDS9960_ENABLE = 0x80
    const APDS9960_ATIME = 0x81
    const APDS9960_CONTROL = 0x8F
    const APDS9960_STATUS = 0x93
    const APDS9960_CDATAL = 0x94
    const APDS9960_CDATAH = 0x95
    const APDS9960_RDATAL = 0x96
    const APDS9960_RDATAH = 0x97
    const APDS9960_GDATAL = 0x98
    const APDS9960_GDATAH = 0x99
    const APDS9960_BDATAL = 0x9A
    const APDS9960_BDATAH = 0x9B
    const APDS9960_GCONF4 = 0xAB
    const APDS9960_AICLEAR = 0xE7

    let color_first_init = false
    let color_new_init = false

    function i2cwrite_color(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread_color(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    export function init() {

        // init module
        i2cwrite_color(APDS9960_ADDR, APDS9960_ATIME, 252)
        i2cwrite_color(APDS9960_ADDR, APDS9960_CONTROL, 0x03)
        i2cwrite_color(APDS9960_ADDR, APDS9960_ENABLE, 0x00)
        i2cwrite_color(APDS9960_ADDR, APDS9960_GCONF4, 0x00)
        i2cwrite_color(APDS9960_ADDR, APDS9960_AICLEAR, 0x00)
        i2cwrite_color(APDS9960_ADDR, APDS9960_ENABLE, 0x01)
        color_first_init = true

        // set to color mode
        let tmp = i2cread_color(APDS9960_ADDR, APDS9960_ENABLE) | 0x2;
        i2cwrite_color(APDS9960_ADDR, APDS9960_ENABLE, tmp);
    }

    export function readColor(): Color {
        let buf = pins.createBuffer(2)
        let c = 0
        let r = 0
        let g = 0
        let b = 0
        let temp_c = 0
        let temp_r = 0
        let temp_g = 0
        let temp_b = 0
        let temp = 0

        if (color_new_init == false && color_first_init == false) {
            let i = 0;
            while (i++ < 15) {
                buf[0] = 0x81
                buf[1] = 0xCA
                pins.i2cWriteBuffer(0x43, buf)
                buf[0] = 0x80
                buf[1] = 0x17
                pins.i2cWriteBuffer(0x43, buf)
                basic.pause(50);

                if ((i2cread_color(0x43, 0xA4) + i2cread_color(0x43, 0xA5) * 256) != 0) {
                    color_new_init = true
                    break;
                }
            }
        }
        if (color_new_init == true) {
            basic.pause(150);
            c = i2cread_color(0x43, 0xA6) + i2cread_color(0x43, 0xA7) * 256;
            r = i2cread_color(0x43, 0xA0) + i2cread_color(0x43, 0xA1) * 256;
            g = i2cread_color(0x43, 0xA2) + i2cread_color(0x43, 0xA3) * 256;
            b = i2cread_color(0x43, 0xA4) + i2cread_color(0x43, 0xA5) * 256;

            r *= 1.3 * 0.47 * 0.83
            g *= 0.69 * 0.56 * 0.83
            b *= 0.80 * 0.415 * 0.83
            c *= 0.3

            if (r > b && r > g) {
                b *= 1.18;
                g *= 0.95
            }

            temp_c = c
            temp_r = r
            temp_g = g
            temp_b = b

            r = Math.min(r, 4095.9356)
            g = Math.min(g, 4095.9356)
            b = Math.min(b, 4095.9356)
            c = Math.min(c, 4095.9356)

            if (temp_b < temp_g) {
                temp = temp_b
                temp_b = temp_g
                temp_g = temp
            }
        }
        else {
            if (color_first_init == false)
                init()
            let tmp = i2cread_color(APDS9960_ADDR, APDS9960_STATUS) & 0x1;
            while (!tmp) {
                basic.pause(5);
                tmp = i2cread_color(APDS9960_ADDR, APDS9960_STATUS) & 0x1;
            }
            c = i2cread_color(APDS9960_ADDR, APDS9960_CDATAL) + i2cread_color(APDS9960_ADDR, APDS9960_CDATAH) * 256;
            r = i2cread_color(APDS9960_ADDR, APDS9960_RDATAL) + i2cread_color(APDS9960_ADDR, APDS9960_RDATAH) * 256;
            g = i2cread_color(APDS9960_ADDR, APDS9960_GDATAL) + i2cread_color(APDS9960_ADDR, APDS9960_GDATAH) * 256;
            b = i2cread_color(APDS9960_ADDR, APDS9960_BDATAL) + i2cread_color(APDS9960_ADDR, APDS9960_BDATAH) * 256;
        }

        // map to rgb based on clear channel
        let avg = c / 3;
        r = r * 255 / avg;
        g = g * 255 / avg;
        b = b * 255 / avg;

        // translate rgb to hue
        let hue = rgb2hsl(r, g, b)
        if (color_new_init == true && hue >= 180 && hue <= 151 && temp_c >= 6000 && (temp_b - temp_g) < 1500 || (temp_r > 4096 && temp_g > 4096 && temp_b > 4096)) {
            temp_c = Math.map(temp_c, 0, 15000, 0, 13000);
            hue = 180 + (13000 - temp_c) / 1500.0;
        }

        // translate hue to color
        if (hue > 330 || hue < 15)
            return Color.Red
        if (hue > 115 && 180 > hue)
            return Color.Green
        if (hue > 215 && 270 > hue)
            return Color.Blue
        if (hue > 190 && 215 > hue)
            return Color.Cyan
        if (hue > 260 && 330 > hue)
            return Color.Magenta
        if (hue > 30 && 115 > hue)
            return Color.Yellow
        if (hue >= 180 && 190 > hue)
            return Color.White
        return Color.Black
    }

}

enum Side {
    //% block="None"
    None,
    //% block="A"
    A,
    //% block="B"
    B
}

CForklift.init()

let PACKCOLOR = Color.None
let PACKSIDE = Side.None

let ROUTEBUSY = false

let HEADING: number
let COLOR: Color
let SIDE: Side

type jobHandler = () => void

let RouteGreenBringA: jobHandler
let RouteGreenStartA: jobHandler
let RouteBlueBringA: jobHandler
let RouteBlueStartA: jobHandler
let RouteYellowBringA: jobHandler
let RouteYellowStartA: jobHandler

let RouteGreenBringB: jobHandler
let RouteGreenStartB: jobHandler
let RouteBlueBringB: jobHandler
let RouteBlueStartB: jobHandler
let RouteYellowBringB: jobHandler
let RouteYellowStartB: jobHandler

let RouteHomeToStart: jobHandler
let RouteStartToHome: jobHandler

let StartNextJob: jobHandler

function handle(cmd: number) {
    // message from the package intake
    PACKCOLOR = (cmd && 0x0FFF) << 4
    PACKSIDE = (cmd && 0xF000)
}

function display() {
}

basic.forever(function() {
    if (ROUTEBUSY) return
    if (!PACKCOLOR || !PACKSIDE) return
    if (StartNextJob) StartNextJob()
})

//% color="#00CC00" icon="\uf1f9"
//% block="Forklift"
//% block.loc.nl="Heftruck"
namespace CForklift {

    export enum Lift {
        //% block="up"
        //% block.loc.nl="omhoog"
        Up,
        //% block="down"
        //% block.loc.nl="omlaag"
        Down
    }

    export enum Turn {
        //% block="quarter turn anticlockwise"
        //% block.loc.nl="kwartslag naar links"
        QuarterACW,
        //% block="quarter turn clockwise"
        //% block.loc.nl="kwartslag naar rechts"
        QuarterCW,
        //% block="half turn"
        //% block.loc.nl="halve draai"
        Half
    }

    export enum Direction {
        //% block="front"
        //% block.loc.nl="voren"
        Front,
        //% block="back"
        //% block.loc.nl="achteren"
        Back,
        //% block="left"
        //% block.loc.nl="links"
        Left,
        //% block="right"
        //% block.loc.nl="rechts"
        Right
    }

    export function init() {
        HEADING = input.compassHeading()
        ColorSensor.init()
        basic.showLeds(`
            . . . . .
            . . . . .
            . . # . .
            . . . . .
            . . . . .
            `)
        basic.pause(500)
        basic.showIcon(IconNames.SmallSquare)
        basic.pause(500)
        basic.showIcon(IconNames.Square)
        basic.pause(500)
        basic.clearScreen()
        CForklift.lift(CForklift.Lift.Up)
        basic.pause(500)
        CForklift.lift(CForklift.Lift.Down)
        basic.showIcon(IconNames.Yes)
    }

    //% block="stop"
    //% block.loc.nl="stop"
    export function stop() {
        Nezha.motorSpeed(Motor.M1, -15)
        Nezha.motorSpeed(Motor.M2, 15)
        Nezha.motorSpeed(Motor.M3, -15)
        Nezha.motorSpeed(Motor.M4, 15)
        basic.pause(250) // let the forklift fully come to rest
    }

    //% block="arrived at %col"
    //% block.loc.nl="bij %col aangekomen"
    export function arrivedAt(col: Color): boolean {
        return (col == ColorSensor.readColor())
    }

    //% block="move to the %dir"
    //% block="rijd naar %dir"
    export function move(dir: Direction) {
        switch (dir) {
            case Direction.Front:
                Nezha.motorSpeed(Motor.M1, -15)
                Nezha.motorSpeed(Motor.M2, 15)
                Nezha.motorSpeed(Motor.M3, -15)
                Nezha.motorSpeed(Motor.M4, 15)
                break;
            case Direction.Back:
                Nezha.motorSpeed(Motor.M1, 15)
                Nezha.motorSpeed(Motor.M2, -15)
                Nezha.motorSpeed(Motor.M3, 15)
                Nezha.motorSpeed(Motor.M4, -15)
                break;
            case Direction.Left:
                Nezha.motorSpeed(Motor.M1, -15)
                Nezha.motorSpeed(Motor.M2, 15)
                Nezha.motorSpeed(Motor.M3, 15)
                Nezha.motorSpeed(Motor.M4, -15)
                break;
            case Direction.Right:
                Nezha.motorSpeed(Motor.M1, 15)
                Nezha.motorSpeed(Motor.M2, -15)
                Nezha.motorSpeed(Motor.M3, -15)
                Nezha.motorSpeed(Motor.M4, 15)
                break;
        }
    }

    //% block="make a %turn"
    //% block.loc.nl="maak een %turn"
    export function rotate(turn: Turn) {
        switch (turn) {
            case Turn.QuarterACW:
                Nezha.motorSpeed(Motor.M1, 15)
                Nezha.motorSpeed(Motor.M2, 15)
                Nezha.motorSpeed(Motor.M3, 15)
                Nezha.motorSpeed(Motor.M4, 15)
                break;
            case Turn.QuarterCW:
                Nezha.motorSpeed(Motor.M1, -15)
                Nezha.motorSpeed(Motor.M2, -15)
                Nezha.motorSpeed(Motor.M3, -15)
                Nezha.motorSpeed(Motor.M4, -15)
                break;
            case Turn.Half:
                Nezha.motorSpeed(Motor.M1, 15)
                Nezha.motorSpeed(Motor.M2, 15)
                Nezha.motorSpeed(Motor.M3, 15)
                Nezha.motorSpeed(Motor.M4, 15)
                break;
        }
    }

    //% color="#FFCC00"
    //% block="when a new pallet is taken in"
    //% block.locx.nl="wanneer een nieuwe pallet binnenkomt"
    export function onStartNextJob(programmableCode: () => void): void {
        StartNextJob = programmableCode;
    }

    //% subcategory="Bestemming"
    //% block="return from %col side %side"
    //% block="terug vanaf %col zijde %side"
    export function returnToStart(col: Color, side: Side) {
        switch (col) {
            case Color.Green:
                if ((side == Side.A) && RouteGreenStartA) RouteGreenStartA()
                if ((side == Side.B) && RouteGreenStartB) RouteGreenStartB()
                break;
            case Color.Blue:
                if ((side == Side.A) && RouteBlueStartA) RouteBlueStartA()
                if ((side == Side.B) && RouteBlueStartB) RouteBlueStartB()
                break;
            case Color.Yellow:
                if ((side == Side.A) && RouteYellowStartA) RouteYellowStartA()
                if ((side == Side.B) && RouteYellowStartB) RouteYellowStartB()
                break;
        }
    }

    //% subcategory="Bestemming"
    //% block="bring to %col, side %side"
    //% block="breng naar %col zijde %side"
    export function bringTo(col: Color, side: Side) {
        switch (col) {
            case Color.Green:
                if ((side == Side.A) && RouteGreenBringA) RouteGreenBringA()
                if ((side == Side.B) && RouteGreenBringB) RouteGreenBringB()
                break;
            case Color.Blue:
                if ((side == Side.A) && RouteBlueBringA) RouteBlueBringA()
                if ((side == Side.B) && RouteBlueBringB) RouteBlueBringB()
                break;
            case Color.Yellow:
                if ((side == Side.A) && RouteYellowBringA) RouteYellowBringA()
                if ((side == Side.B) && RouteYellowBringB) RouteYellowBringB()
                break;
        }
    }

    //% subcategory="Bestemming"
    //% block="SIDE equals %side"
    //% block="ZIJDE is gelijk aan %side"
    export function isSide(side: Side): boolean {
        return (side == SIDE)
    }

    //% subcategory="Bestemming"
    //% block="SIDE = %side"
    //% block="ZIJDE = %side"
    export function setSide(side: Side) {
        SIDE = side
    }

    //% subcategory="Bestemming"
    //% block="COLOR equals %col"
    //% block="KLEUR is gelijk aan %col"
    export function isColor(col: Color): boolean {
        return (col == COLOR)
    }

    //% subcategory="Bestemming"
    //% block="COLOR = %col"
    //% block="KLEUR = %col"
    export function setColor(col: Color) {
        COLOR = col
    }

    //% subcategory="Liftbediening"
    //% block="is loaded"
    //% block.loc.nl="is geladen"
    export function isLoaded(): boolean {
        pins.setPull(Connector.J1, PinPullMode.PullUp)
        return (pins.digitalReadPin(Connector.J1) == 0)
    }

    //% subcategory="Liftbediening"
    //% block="unloading"
    //% block.loc.nl="lossen"
    export function unloading() {
    }

    //% subcategory="Liftbediening"
    //% block="loading"
    //% block.loc.nl="laden"
    export function loading() {
    }

    //% subcategory="Liftbediening"
    //% block="move the lift %dir"
    //% block.loc.nl="beweeg de lift %dir"
    export function lift(dir: Lift) {
        if (dir) { // down
            for (let i = 315; i >= 0; i--) {
                Nezha.servoAngle( Servo.S1, 360 - i)
                basic.pause(2)
            }
            Nezha.servoAngle( Servo.S2, 350)
            basic.pause(150)
            Nezha.servoAngle( Servo.S2, 360)
        }
        else { // up
            Nezha.servoAngle( Servo.S2, 350)
            basic.pause(150)
            Nezha.servoAngle( Servo.S2, 340)
            for (let i = 0; i <= 315; i++) {
                Nezha.servoAngle(Servo.S1, 360 - i)
                basic.pause(2)
            }
        }
    }

    //% subcategory="Route"
    //% color="#FFCC00"
    //% block="bring to green A"
    //% block.locx.nl="breng naar groen A"
    export function goRouteGreenBringA(programmableCode: () => void): void {
        RouteGreenBringA = programmableCode;
    }

    //% subcategory="Route"
    //% color="#FFCC00"
    //% block="bring to green B"
    //% block.locx.nl="breng naar groen B"
    export function goRouteGreenBringB(programmableCode: () => void): void {
        RouteGreenBringB = programmableCode;
    }

    //% subcategory="Route"
    //% color="#FFCC00"
    //% block="bring to blue A"
    //% block.locx.nl="breng naar blauw A"
    export function goRouteBlueBringA(programmableCode: () => void): void {
        RouteBlueBringA = programmableCode;
    }

    //% subcategory="Route"
    //% color="#FFCC00"
    //% block="bring to blue B"
    //% block.locx.nl="breng naar blauw B"
    export function goRouteBlueBringB(programmableCode: () => void): void {
        RouteBlueBringB = programmableCode;
    }

    //% subcategory="Route"
    //% color="#FFCC00"
    //% block="bring to yellow A"
    //% block.locx.nl="breng naar geel A"
    export function goRouteYellowBringA(programmableCode: () => void): void {
        RouteGreenBringA = programmableCode;
    }

    //% subcategory="Route"
    //% color="#FFCC00"
    //% block="bring to yellow B"
    //% block.locx.nl="breng naar geel B"
    export function goRouteYellowBringB(programmableCode: () => void): void {
        RouteYellowBringB = programmableCode;
    }

    //% subcategory="Route"
    //% color="#FFCC00"
    //% block="from home to start"
    //% block.locx.nl="van thuisbasis naar start"
    export function goRouteHomeToStart(programmableCode: () => void): void {
        RouteHomeToStart = programmableCode;
    }

    //% subcategory="Route"
    //% color="#FFCC00"
    //% block="from start to home"
    //% block.locx.nl="van start naar thuisbasis"
    export function goStartToHome(programmableCode: () => void): void {
        RouteStartToHome = programmableCode;
    }
}
