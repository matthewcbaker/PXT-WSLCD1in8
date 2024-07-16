/*****************************************************************************
* | File      	:   1in8LCD.ts
* | Author(1)   :   hnwangkg-ezio for Waveshare 
* | Author(2)   :   pitchcat
* | Author(3)   :   matthewcbaker
* | Function    :   Contorl 1.8inch lcd Show
* | Info        :   for micro:bit v2
******************************************************************************/
let GUI_BACKGROUND_COLOR = 1
let FONT_BACKGROUND_COLOR = 1
let FONT_FOREGROUND_COLOR = 0

let LCD_WIDTH = 160  //LCD width
let LCD_HEIGHT = 128 //LCD height

// SRAM opcodes
let SRAM_CMD_WREN = 0x06
let SRAM_CMD_WRDI = 0x04
let SRAM_CMD_RDSR = 0x05
let SRAM_CMD_WRSR = 0x01
let SRAM_CMD_READ = 0x03
let SRAM_CMD_WRITE = 0x02

// SRAM modes
let SRAM_BYTE_MODE = 0x00
let SRAM_PAGE_MODE = 0x80
let SRAM_STREAM_MODE = 0x40

enum COLOR {
    //% block=white
    WHITE = 0xFFFF,
    //% block=black
    BLACK = 0x0000,
    //% block=blue
    BLUE = 0x001F,
    //% block=purple
    BRED = 0XF81F,
    //% block=brown
    GRED = 0XFFE0,
    //% block=blue green
    GBLUE = 0X07FF,
    //% block=red
    RED = 0xF800,
    //% block=magenta
    MAGENTA = 0xF81F,
    //% block=green
    GREEN = 0x07E0,
    //% block=cyan
    CYAN = 0x7FFF,
    //% block=yellow
    YELLOW = 0xFFE0,
    //% block=brown
    BROWN = 0XBC40,
    //% block=dark brown
    BRRED = 0XFC07,
    //% block=gray
    GRAY = 0X8430
}

enum DOT_PIXEL {
    DOT_PIXEL_1 = 1,
    DOT_PIXEL_2,
    DOT_PIXEL_3,
    DOT_PIXEL_4
};

enum LINE_STYLE {
    //% block=solid
    LINE_SOLID = 0,
    //% block=dotted
    LINE_DOTTED,
};

enum DRAW_FILL {
    //% block=empty
    DRAW_EMPTY = 0,
    //% block=full
    DRAW_FULL,
};

enum LOCATION {
    //% block="screen"
    SCREEN = 0,
    //% block="memory"
    MEMORY,
    //% block="screen and memory"
    SCREEN_MEMORY
}

const Font12_Table = hex`000000000000000000000000001010101010000010000000006C48480000000000000000001414287C287C2850500000001038404038487010100000002050200C7008140800000000000018202054483400000000101010100000000000000000080810101010101008080000202010101010101020200000107C1028280000000000000000101010FE10101000000000000000000000181030200000000000007C00000000000000000000000000303000000000040408081010202040000000384444444444443800000000301010101010107C00000000384404081020447C000000003844041804044438000000000C141424447E040E000000003C20203804044438000000001C20407844444438000000007C4404080808101000000000384444384444443800000000384444443C04087000000000000030300000303000000000000018180000183020000000000C10608060100C000000000000007C007C00000000000000C02018041820C00000000000182404081000300000003844444C54544C40443800000030102828287C44EE00000000F8444478444444F8000000003C4440404040443800000000F0484444444448F000000000FC445070504044FC000000007E22283828202070000000003C4440404E44443800000000EE44447C444444EE000000007C1010101010107C000000003C0808084848483000000000EE444850704844E600000000702020202024247C00000000EE6C6C54544444EE00000000EE64645454544CEC0000000038444444444444380000000078242424382020700000000038444444444444381C000000F8444444784844E200000000344C40380404645800000000FE9210101010103800000000EE4444444444443800000000EE4444282828101000000000EE4444545454542800000000C6442810102844C600000000EE44282810101038000000007C4408101020447C0000000038202020202020202038000040202020101008080800000038080808080808080838000010102844000000000000000000000000000000000000FE00100800000000000000000000000038443C44443E00000000C0405864444444F80000000000003C4440404438000000000C04344C4444443E00000000000038447C40403C000000001C207C202020207C000000000000364C4444443C04380000C0405864444444EE00000000100070101010107C00000000100078080808080808700000C0405C48705048DC00000000301010101010107C000000000000E854545454FE000000000000D864444444EE000000000000384444444438000000000000D8644444447840E000000000364C4444443C040E000000006C302020207C0000000000003C44380444780000000000207C202020221C000000000000CC4444444C36000000000000EE4444282810000000000000EE4454545428000000000000CC48303048CC000000000000EE44242818101078000000007C481020447C000000000810101010201010100800001010101010101010100000002010101010081010102000000000000024580000000000`;

pins.spiPins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13)
pins.spiFormat(8, 0)
//pins.spiFrequency(18000000)
pins.spiFrequency(80000000)

//% weight=20 color=#436EEE icon="\uf108"
//% groups=['Initialise', 'Settings', 'Drawing', 'Colours', 'Old']
namespace LCD1IN8 {

    let defaultLocation: LOCATION = LOCATION.SCREEN

    //% block="initialise LCD"
    //% group='Initialise'
    export function initialise(): void {
        LCD_Init()
    }

    //% block="set default draw location to $location"
    //% group='Settings'
    export function setDefaultLocation(location: LOCATION): void {
        defaultLocation = location
    }

    //% block="draw pixel x $x y $y colour $colour||to $location"
    //% x.min=0 x.max=159 x.defl=0
    //% y.min=0 y.max=127 y.defl=0
    //% colour.min=0 colour.max=65535
    //% inlineInputMode=inline
    //% expandableArgumentMode=toggle
    //% group='Drawing'
    export function drawPixel(x: number, y: number, colour: number, location?: LOCATION): void {
        if (location === undefined)
            location = defaultLocation
        if (location == LOCATION.SCREEN || location == LOCATION.SCREEN_MEMORY)
            LCD_DirectSetPoint(x + 1, y + 1, colour)
        if (location == LOCATION.MEMORY || location == LOCATION.SCREEN_MEMORY)
            LCD_SetPoint(x + 1, y + 1, colour)
    }

    //% blockId=LCD_Init
    //% blockGap=8
    //% block="LCD1IN8 Init"
    //% group='Old'
    //% weight=200
    export function LCD_Init(): void {
        pins.digitalWritePin(DigitalPin.P8, 1);
        control.waitMicros(100);
        pins.digitalWritePin(DigitalPin.P8, 0);
        control.waitMicros(100);
        pins.digitalWritePin(DigitalPin.P8, 1);

        //ST7735R Frame Rate
        LCD_WriteReg(0xB1);
        LCD_WriteData_8Bit(0x01);
        LCD_WriteData_8Bit(0x2C);
        LCD_WriteData_8Bit(0x2D);

        LCD_WriteReg(0xB2);
        LCD_WriteData_8Bit(0x01);
        LCD_WriteData_8Bit(0x2C);
        LCD_WriteData_8Bit(0x2D);

        LCD_WriteReg(0xB3);
        LCD_WriteData_8Bit(0x01);
        LCD_WriteData_8Bit(0x2C);
        LCD_WriteData_8Bit(0x2D);
        LCD_WriteData_8Bit(0x01);
        LCD_WriteData_8Bit(0x2C);
        LCD_WriteData_8Bit(0x2D);

        LCD_WriteReg(0xB4); //Column inversion
        LCD_WriteData_8Bit(0x07);

        //ST7735R Power Sequence
        LCD_WriteReg(0xC0);
        LCD_WriteData_8Bit(0xA2);
        LCD_WriteData_8Bit(0x02);
        LCD_WriteData_8Bit(0x84);
        LCD_WriteReg(0xC1);
        LCD_WriteData_8Bit(0xC5);

        LCD_WriteReg(0xC2);
        LCD_WriteData_8Bit(0x0A);
        LCD_WriteData_8Bit(0x00);

        LCD_WriteReg(0xC3);
        LCD_WriteData_8Bit(0x8A);
        LCD_WriteData_8Bit(0x2A);
        LCD_WriteReg(0xC4);
        LCD_WriteData_8Bit(0x8A);
        LCD_WriteData_8Bit(0xEE);

        LCD_WriteReg(0xC5); //VCOM
        LCD_WriteData_8Bit(0x0E);

        //ST7735R Gamma Sequence
        LCD_WriteReg(0xe0);
        LCD_WriteData_8Bit(0x0f);
        LCD_WriteData_8Bit(0x1a);
        LCD_WriteData_8Bit(0x0f);
        LCD_WriteData_8Bit(0x18);
        LCD_WriteData_8Bit(0x2f);
        LCD_WriteData_8Bit(0x28);
        LCD_WriteData_8Bit(0x20);
        LCD_WriteData_8Bit(0x22);
        LCD_WriteData_8Bit(0x1f);
        LCD_WriteData_8Bit(0x1b);
        LCD_WriteData_8Bit(0x23);
        LCD_WriteData_8Bit(0x37);
        LCD_WriteData_8Bit(0x00);
        LCD_WriteData_8Bit(0x07);
        LCD_WriteData_8Bit(0x02);
        LCD_WriteData_8Bit(0x10);

        LCD_WriteReg(0xe1);
        LCD_WriteData_8Bit(0x0f);
        LCD_WriteData_8Bit(0x1b);
        LCD_WriteData_8Bit(0x0f);
        LCD_WriteData_8Bit(0x17);
        LCD_WriteData_8Bit(0x33);
        LCD_WriteData_8Bit(0x2c);
        LCD_WriteData_8Bit(0x29);
        LCD_WriteData_8Bit(0x2e);
        LCD_WriteData_8Bit(0x30);
        LCD_WriteData_8Bit(0x30);
        LCD_WriteData_8Bit(0x39);
        LCD_WriteData_8Bit(0x3f);
        LCD_WriteData_8Bit(0x00);
        LCD_WriteData_8Bit(0x07);
        LCD_WriteData_8Bit(0x03);
        LCD_WriteData_8Bit(0x10);

        LCD_WriteReg(0xF0); //Enable test command
        LCD_WriteData_8Bit(0x01);

        LCD_WriteReg(0xF6); //Disable ram power save mode
        LCD_WriteData_8Bit(0x00);

        LCD_WriteReg(0x3A); //65k mode
        LCD_WriteData_8Bit(0x05);

        LCD_WriteReg(0x36); //MX, MY, RGB mode
        LCD_WriteData_8Bit(0xF7 & 0xA0); //RGB color filter panel

        //sleep out
        LCD_WriteReg(0x11);
        control.waitMicros(100);

        //LCD_WriteReg(0x29);
        SPIRAM_Set_Mode(SRAM_BYTE_MODE);
    }

    //% blockId=LCD_Clear
    //% blockGap=8
    //% block="LCD Clear"
    //% weight=195
    export function LCD_Clear(): void {
        LCD_SetWindows(0, 0, LCD_WIDTH, LCD_HEIGHT);
        LCD_SetColor(0x0000, LCD_WIDTH + 2, LCD_HEIGHT + 2);
        LCD_WriteReg(0x29);
    }

    //% blockId=LCD_Color
    //% blockGap=8
    //% block="Color %Color"
    export function LCD_Color(Color: COLOR): number {
        return Color;
    }

    //% blockId=LCD_RGB
    //% blockGap=8
    //% block="red %red|green %green|blue %blue"
    //% red.min=0 red.max=255 green.min=0 green.max=255 blue.min=0 blue.max=255
    export function LCD_RGB(red: number, green: number, blue: number): number {
        return (((red >> 3) & 0x1F) << 11) | (((green >> 2) & 0x3F) << 5) | ((blue >> 3) & 0x1F);
    }

    //% blockId=LCD_Filling
    //% blockGap=8
    //% block="Filling Color %Color"
    //% weight=195
    export function LCD_Filling(Color: number): void {
        LCD_SetWindows(0, 0, LCD_WIDTH, LCD_HEIGHT);
        LCD_SetColor(Color, LCD_WIDTH + 2, LCD_HEIGHT + 2);
    }

    //% blockId=LCD_SetBL
    //% blockGap=8
    //% block="Set back light level %Lev"
    //% Lev.min=0 Lev.max=1023
    //% weight=180
    export function LCD_SetBL(Lev: number): void {
        pins.analogWritePin(AnalogPin.P1, 1023)
    }

    //% blockId=LCD_Flip
    //% blockGap=8
    //% block="Flip Screen %flip"
    //% flip.min=0 flip.max=1
    export function LCD_Flip(flip: number): void {
        LCD_WriteReg(0x36); //MX, MY, RGB mode
        // original MX+MV
        // flip  MV+MY
        LCD_WriteData_8Bit(0xF7 & ((flip != 0) ? 0x60 : 0xA0)); //RGB color filter panel
    }

    function LCD_WriteReg(reg: number): void {
        pins.digitalWritePin(DigitalPin.P12, 0);
        pins.digitalWritePin(DigitalPin.P16, 0);
        pins.spiWrite(reg);
        pins.digitalWritePin(DigitalPin.P16, 1);
    }

    function LCD_WriteData_8Bit(Data: number): void {
        pins.digitalWritePin(DigitalPin.P12, 1);
        pins.digitalWritePin(DigitalPin.P16, 0);
        pins.spiWrite(Data);
        pins.digitalWritePin(DigitalPin.P16, 1);
    }

    function LCD_WriteData_Buf(Buf: number, len: number): void {
        pins.digitalWritePin(DigitalPin.P12, 1);
        pins.digitalWritePin(DigitalPin.P16, 0);
        let i = 0;
        for (i = 0; i < len; i++) {
            pins.spiWrite((Buf >> 8));
            pins.spiWrite((Buf & 0XFF));
        }
        pins.digitalWritePin(DigitalPin.P16, 1);
    }

    function LCD_SetWindows(Xstart: number, Ystart: number, Xend: number, Yend: number): void {
        //set the X coordinates
        LCD_WriteReg(0x2A);
        LCD_WriteData_8Bit(0x00);
        LCD_WriteData_8Bit((Xstart & 0xff) + 1);
        LCD_WriteData_8Bit(0x00);
        LCD_WriteData_8Bit(((Xend - 1) & 0xff) + 1);

        //set the Y coordinates
        LCD_WriteReg(0x2B);
        LCD_WriteData_8Bit(0x00);
        LCD_WriteData_8Bit((Ystart & 0xff) + 2);
        LCD_WriteData_8Bit(0x00);
        LCD_WriteData_8Bit(((Yend - 1) & 0xff) + 2);

        LCD_WriteReg(0x2C);
    }

    function LCD_SetColor(Color: number, Xpoint: number, Ypoint: number): void {
        LCD_WriteData_Buf(Color, Xpoint * Ypoint);
    }

    function LCD_SetPoint(Xpoint: number, Ypoint: number, Color: number): void {
        let Addr = (Xpoint + Ypoint * 160) * 2;
        SPIRAM_WR_Byte(Addr, Color >> 8);
        SPIRAM_WR_Byte(Addr + 1, Color & 0xff);
    }

    function LCD_DirectSetPoint(Xpoint: number, Ypoint: number, Color: number): void {
        LCD_SetWindows(Xpoint, Ypoint, Xpoint + 1, Ypoint + 1);
        LCD_WriteData_8Bit(Color >> 8);
        LCD_WriteData_8Bit(Color & 0xFF);
    }

    //% blockId=Draw_Clear
    //% blockGap=8
    //% block="Clear Drawing cache %Color"
    //% weight=195
    export function LCD_ClearBuf(Color: number = 0xFFFF): void {
        let i;
        let b1 = (Color >> 8) & 0xFF;
        let b2 = (Color & 0xFF);
        SPIRAM_Set_Mode(SRAM_STREAM_MODE);
        pins.digitalWritePin(DigitalPin.P2, 0);
        pins.spiWrite(SRAM_CMD_WRITE);
        pins.spiWrite(0);
        pins.spiWrite(0);
        pins.spiWrite(0);

        for (i = 0; i < 160 * 2 * 128; i++) {
            pins.spiWrite((i & 1) == 0 ? b1 : b2);
        }
        pins.digitalWritePin(DigitalPin.P2, 1);
    }

    //% blockId=LCD_DisplayWindows
    //% blockGap=8
    //% block="Show Windows display data |Xstart %Xstart|Ystart %Ystart|Xend %Xend|Yend %Yend "
    //% Xstart.min=1 Xstart.max=160 Ystart.min=1 Ystart.max=128
    //% Xend.min=1 Xend.max=160 Yend.min=1 Yend.max=128
    export function LCD_DisplayWindows(Xstart: number, Ystart: number, Xend: number, Yend: number): void {
        let rbuf = [];
        for (let i = 0; i < (Xend - Xstart + 1) * 2; i++) {
            rbuf[i] = 0;
        }
        SPIRAM_Set_Mode(SRAM_STREAM_MODE);
        LCD_SetWindows(Xstart, Ystart, Xend, Yend);
        let w = Xend - Xstart * 2;
        for (let y = Ystart; y < Yend; y++) {
            pins.digitalWritePin(DigitalPin.P2, 0);
            pins.spiWrite(SRAM_CMD_READ);
            pins.spiWrite(0);
            let addr = (LCD_WIDTH * y + Xstart) * 2;
            pins.spiWrite(addr >> 8);
            pins.spiWrite(addr & 0xff);
            for (let offset = 0; offset < w; offset++) {
                rbuf[offset] = pins.spiWrite(0x00);
            }
            pins.digitalWritePin(DigitalPin.P2, 1);

            pins.digitalWritePin(DigitalPin.P12, 1);
            pins.digitalWritePin(DigitalPin.P16, 0);
            for (let offset = 0; offset < w; offset++) {
                pins.spiWrite(rbuf[offset]);
            }
            pins.digitalWritePin(DigitalPin.P16, 1);
        }
    }

    //% blockId=LCD_Display
    //% blockGap=8
    //% block="Show Full Screen"
    //% weight=190
    export function LCD_Display(): void {
        SPIRAM_Set_Mode(SRAM_STREAM_MODE);
        LCD_SetWindows(0, 0, 160, 128);
        let rbuf = [];
        for (let i = 0; i < 640; i++) {
            rbuf[i] = 0;
        }

        let rdata = 0;
        for (let i = 0; i < 64; i++) { // read 2line
            pins.digitalWritePin(DigitalPin.P2, 0);
            pins.spiWrite(SRAM_CMD_READ);
            pins.spiWrite(0);
            pins.spiWrite((640 * i) >> 8);
            pins.spiWrite((640 * i) & 0xff);
            for (let offset = 0; offset < 640; offset++) {
                rbuf[offset] = pins.spiWrite(0x00);
            }
            pins.digitalWritePin(DigitalPin.P2, 1);

            pins.digitalWritePin(DigitalPin.P12, 1);
            pins.digitalWritePin(DigitalPin.P16, 0);
            for (let offset = 0; offset < 640; offset++) {
                pins.spiWrite(rbuf[offset]);
            }
            pins.digitalWritePin(DigitalPin.P16, 1);
        }

        //Turn on the LCD display
        LCD_WriteReg(0x29);
    }

    //% blockId=DrawPoint
    //% blockGap=8
    //% block="Draw Point|x %Xpoint|y %Ypoint|Color %Color|Point Size %Dot_Pixel"
    //% Xpoint.min=1 Xpoint.max=160 Ypoint.min=1 Ypoint.max=128
    //% Color.min=0 Color.max=65535
    //% weight=150
    export function DrawPoint(Xpoint: number, Ypoint: number, Color: number, Dot_Pixel: DOT_PIXEL): void {
        let XDir_Num, YDir_Num;
        for (XDir_Num = 0; XDir_Num < Dot_Pixel; XDir_Num++) {
            for (YDir_Num = 0; YDir_Num < Dot_Pixel; YDir_Num++) {
                LCD_SetPoint(Xpoint + XDir_Num - Dot_Pixel, Ypoint + YDir_Num - Dot_Pixel, Color);
            }
        }
    }

    //% blockId=DirectDrawPoint
    //% blockGap=8
    //% block="DirectDraw Point|x %Xpoint|y %Ypoint|Color %Color|Point Size %Dot_Pixel"
    //% Xpoint.min=1 Xpoint.max=160 Ypoint.min=1 Ypoint.max=128
    //% Color.min=0 Color.max=65535
    export function DirectDrawPoint(Xpoint: number, Ypoint: number, Color: number, Dot_Pixel: DOT_PIXEL): void {
        let XDir_Num, YDir_Num;
        for (XDir_Num = 0; XDir_Num < Dot_Pixel; XDir_Num++) {
            for (YDir_Num = 0; YDir_Num < Dot_Pixel; YDir_Num++) {
                LCD_SetPoint(Xpoint + XDir_Num - Dot_Pixel, Ypoint + YDir_Num - Dot_Pixel, Color);
                LCD_DirectSetPoint(Xpoint + XDir_Num - Dot_Pixel, Ypoint + YDir_Num - Dot_Pixel, Color);
            }
        }
    }


    //% blockId=DrawLine
    //% blockGap=8
    //% block="Draw Line|Xstart %Xstart|Ystart %Ystart|Xend %Xend|Yend %Yend|Color %Color|width %Line_width|Style %Line_Style"
    //% Xstart.min=1 Xstart.max=160 Ystart.min=1 Ystart.max=128
    //% Xend.min=1 Xend.max=160 Yend.min=1 Yend.max=128
    //% Color.min=0 Color.max=65535
    //% weight=140
    export function DrawLine(Xstart: number, Ystart: number, Xend: number, Yend: number, Color: number, Line_width: DOT_PIXEL, Line_Style: LINE_STYLE): void {
        if (Xstart > Xend)
            Swop_AB(Xstart, Xend);
        if (Ystart > Yend)
            Swop_AB(Ystart, Yend);

        let Xpoint = Xstart;
        let Ypoint = Ystart;
        let dx = Xend - Xstart >= 0 ? Xend - Xstart : Xstart - Xend;
        let dy = Yend - Ystart <= 0 ? Yend - Ystart : Ystart - Yend;

        // Increment direction, 1 is positive, -1 is counter;
        let XAddway = Xstart < Xend ? 1 : -1;
        let YAddway = Ystart < Yend ? 1 : -1;

        //Cumulative error
        let Esp = dx + dy;
        let Line_Style_Temp = 0;

        for (; ;) {
            Line_Style_Temp++;
            //Painted dotted line, 2 point is really virtual
            if (Line_Style == LINE_STYLE.LINE_DOTTED && Line_Style_Temp % 3 == 0) {
                DrawPoint(Xpoint, Ypoint, GUI_BACKGROUND_COLOR, Line_width);
                Line_Style_Temp = 0;
            } else {
                DrawPoint(Xpoint, Ypoint, Color, Line_width);
            }
            if (2 * Esp >= dy) {
                if (Xpoint == Xend) break;
                Esp += dy
                Xpoint += XAddway;
            }
            if (2 * Esp <= dx) {
                if (Ypoint == Yend) break;
                Esp += dx;
                Ypoint += YAddway;
            }
        }
    }

    //% blockId=DirectDrawLine
    //% blockGap=8
    //% block="Direct Draw Line|Xstart %Xstart|Ystart %Ystart|Xend %Xend|Yend %Yend|Color %Color|width %Line_width|Style %Line_Style"
    //% Xstart.min=1 Xstart.max=160 Ystart.min=1 Ystart.max=128
    //% Xend.min=1 Xend.max=160 Yend.min=1 Yend.max=128
    //% Color.min=0 Color.max=65535
    export function DirectDrawLine(Xstart: number, Ystart: number, Xend: number, Yend: number, Color: number, Line_width: DOT_PIXEL, Line_Style: LINE_STYLE): void {
        if (Xstart > Xend)
            Swop_AB(Xstart, Xend);
        if (Ystart > Yend)
            Swop_AB(Ystart, Yend);

        let Xpoint = Xstart;
        let Ypoint = Ystart;
        let dx = Xend - Xstart >= 0 ? Xend - Xstart : Xstart - Xend;
        let dy = Yend - Ystart <= 0 ? Yend - Ystart : Ystart - Yend;

        // Increment direction, 1 is positive, -1 is counter;
        let XAddway = Xstart < Xend ? 1 : -1;
        let YAddway = Ystart < Yend ? 1 : -1;

        //Cumulative error
        let Esp = dx + dy;
        let Line_Style_Temp = 0;

        for (; ;) {
            Line_Style_Temp++;
            //Painted dotted line, 2 point is really virtual
            if (Line_Style == LINE_STYLE.LINE_DOTTED && Line_Style_Temp % 3 == 0) {
                DirectDrawPoint(Xpoint, Ypoint, GUI_BACKGROUND_COLOR, Line_width);
                Line_Style_Temp = 0;
            } else {
                DirectDrawPoint(Xpoint, Ypoint, Color, Line_width);
            }
            if (2 * Esp >= dy) {
                if (Xpoint == Xend) break;
                Esp += dy
                Xpoint += XAddway;
            }
            if (2 * Esp <= dx) {
                if (Ypoint == Yend) break;
                Esp += dx;
                Ypoint += YAddway;
            }
        }
    }

    //% blockId=DrawRectangle
    //% blockGap=8
    //% block="Draw Rectangle|Xstart2 %Xstart2|Ystart2 %Ystart2|Xend2 %Xend2|Yend2 %Yend2|Color %Color|Filled %Filled |Line width %Dot_Pixel"
    //% Xstart2.min=1 Xstart2.max=160 Ystart2.min=1 Ystart2.max=128 
    //% Xend2.min=1 Xend2.max=160 Yend2.min=1 Yend2.max=128
    //% Color.min=0 Color.max=65535
    //% weight=130
    export function DrawRectangle(Xstart2: number, Ystart2: number, Xend2: number, Yend2: number, Color: number, Filled: DRAW_FILL, Dot_Pixel: DOT_PIXEL): void {
        if (Xstart2 > Xend2)
            Swop_AB(Xstart2, Xend2);
        if (Ystart2 > Yend2)
            Swop_AB(Ystart2, Yend2);

        let Ypoint = 0;
        if (Filled) {
            for (Ypoint = Ystart2; Ypoint < Yend2; Ypoint++) {
                DrawLine(Xstart2, Ypoint, Xend2, Ypoint, Color, Dot_Pixel, LINE_STYLE.LINE_SOLID);
            }
        } else {
            DrawLine(Xstart2, Ystart2, Xend2, Ystart2, Color, Dot_Pixel, LINE_STYLE.LINE_SOLID);
            DrawLine(Xstart2, Ystart2, Xstart2, Yend2, Color, Dot_Pixel, LINE_STYLE.LINE_SOLID);
            DrawLine(Xend2, Yend2, Xend2, Ystart2, Color, Dot_Pixel, LINE_STYLE.LINE_SOLID);
            DrawLine(Xend2, Yend2, Xstart2, Yend2, Color, Dot_Pixel, LINE_STYLE.LINE_SOLID);
        }
    }

    //% blockId=DirectDrawRectangle
    //% blockGap=8
    //% block="Direct Draw Rectangle|Xstart2 %Xstart2|Ystart2 %Ystart2|Xend2 %Xend2|Yend2 %Yend2|Color %Color|Filled %Filled |Line width %Dot_Pixel"
    //% Xstart2.min=1 Xstart2.max=160 Ystart2.min=1 Ystart2.max=128 
    //% Xend2.min=1 Xend2.max=160 Yend2.min=1 Yend2.max=128
    //% Color.min=0 Color.max=65535
    export function DirectDrawRectangle(Xstart2: number, Ystart2: number, Xend2: number, Yend2: number, Color: number, Filled: DRAW_FILL, Dot_Pixel: DOT_PIXEL): void {
        if (Xstart2 > Xend2)
            Swop_AB(Xstart2, Xend2);
        if (Ystart2 > Yend2)
            Swop_AB(Ystart2, Yend2);

        let Ypoint = 0;
        if (Filled) {
            for (Ypoint = Ystart2; Ypoint < Yend2; Ypoint++) {
                DirectDrawLine(Xstart2, Ypoint, Xend2, Ypoint, Color, Dot_Pixel, LINE_STYLE.LINE_SOLID);
            }
        } else {
            DirectDrawLine(Xstart2, Ystart2, Xend2, Ystart2, Color, Dot_Pixel, LINE_STYLE.LINE_SOLID);
            DirectDrawLine(Xstart2, Ystart2, Xstart2, Yend2, Color, Dot_Pixel, LINE_STYLE.LINE_SOLID);
            DirectDrawLine(Xend2, Yend2, Xend2, Ystart2, Color, Dot_Pixel, LINE_STYLE.LINE_SOLID);
            DirectDrawLine(Xend2, Yend2, Xstart2, Yend2, Color, Dot_Pixel, LINE_STYLE.LINE_SOLID);
        }
    }

    //% blockId=DrawCircle
    //% blockGap=8
    //% block="Draw Circle|X_Center %X_Center|Y_Center %Y_Center|Radius %Radius|Color %Color|Filled %Draw_Fill|Line width %Dot_Pixel"
    //% X_Center.min=1 X_Center.max=160 Y_Center.min=1 Y_Center.max=128
    //% Radius.min=0 Radius.max=160
    //% Color.min=0 Color.max=65535
    //% weight=120
    export function DrawCircle(X_Center: number, Y_Center: number, Radius: number, Color: number, Draw_Fill: DRAW_FILL, Dot_Pixel: DOT_PIXEL): void {
        //Draw a circle from(0, R) as a starting point
        let XCurrent = 0;
        let YCurrent = Radius;

        //Cumulative error,judge the next point of the logo
        let Esp = 3 - (Radius << 1);

        let sCountY = 0;
        if (Draw_Fill == DRAW_FILL.DRAW_FULL) {//DrawPoint(Xpoint, Ypoint, GUI_BACKGROUND_COLOR, Line_width);
            while (XCurrent <= YCurrent) { //Realistic circles
                for (sCountY = XCurrent; sCountY <= YCurrent; sCountY++) {
                    DrawPoint(X_Center + XCurrent, Y_Center + sCountY, Color, DOT_PIXEL.DOT_PIXEL_1);             //1
                    DrawPoint(X_Center - XCurrent, Y_Center + sCountY, Color, DOT_PIXEL.DOT_PIXEL_1);             //2
                    DrawPoint(X_Center - sCountY, Y_Center + XCurrent, Color, DOT_PIXEL.DOT_PIXEL_1);             //3
                    DrawPoint(X_Center - sCountY, Y_Center - XCurrent, Color, DOT_PIXEL.DOT_PIXEL_1);             //4
                    DrawPoint(X_Center - XCurrent, Y_Center - sCountY, Color, DOT_PIXEL.DOT_PIXEL_1);             //5
                    DrawPoint(X_Center + XCurrent, Y_Center - sCountY, Color, DOT_PIXEL.DOT_PIXEL_1);             //6
                    DrawPoint(X_Center + sCountY, Y_Center - XCurrent, Color, DOT_PIXEL.DOT_PIXEL_1);             //7
                    DrawPoint(X_Center + sCountY, Y_Center + XCurrent, Color, DOT_PIXEL.DOT_PIXEL_1);
                }
                if (Esp < 0)
                    Esp += 4 * XCurrent + 6;
                else {
                    Esp += 10 + 4 * (XCurrent - YCurrent);
                    YCurrent--;
                }
                XCurrent++;
            }
        } else { //Draw a hollow circle
            while (XCurrent <= YCurrent) {
                DrawPoint(X_Center + XCurrent, Y_Center + YCurrent, Color, Dot_Pixel);             //1
                DrawPoint(X_Center - XCurrent, Y_Center + YCurrent, Color, Dot_Pixel);             //2
                DrawPoint(X_Center - YCurrent, Y_Center + XCurrent, Color, Dot_Pixel);             //3
                DrawPoint(X_Center - YCurrent, Y_Center - XCurrent, Color, Dot_Pixel);             //4
                DrawPoint(X_Center - XCurrent, Y_Center - YCurrent, Color, Dot_Pixel);             //5
                DrawPoint(X_Center + XCurrent, Y_Center - YCurrent, Color, Dot_Pixel);             //6
                DrawPoint(X_Center + YCurrent, Y_Center - XCurrent, Color, Dot_Pixel);             //7
                DrawPoint(X_Center + YCurrent, Y_Center + XCurrent, Color, Dot_Pixel);             //0

                if (Esp < 0)
                    Esp += 4 * XCurrent + 6;
                else {
                    Esp += 10 + 4 * (XCurrent - YCurrent);
                    YCurrent--;
                }
                XCurrent++;
            }
        }
    }

    //% blockId=DirectDrawCircle
    //% blockGap=8
    //% block="Direct Draw Circle|X_Center %X_Center|Y_Center %Y_Center|Radius %Radius|Color %Color|Filled %Draw_Fill|Line width %Dot_Pixel"
    //% X_Center.min=1 X_Center.max=160 Y_Center.min=1 Y_Center.max=128
    //% Radius.min=0 Radius.max=160
    //% Color.min=0 Color.max=65535
    export function DirectDrawCircle(X_Center: number, Y_Center: number, Radius: number, Color: number, Draw_Fill: DRAW_FILL, Dot_Pixel: DOT_PIXEL): void {
        //Draw a circle from(0, R) as a starting point
        let XCurrent = 0;
        let YCurrent = Radius;

        //Cumulative error,judge the next point of the logo
        let Esp = 3 - (Radius << 1);

        let sCountY = 0;
        if (Draw_Fill == DRAW_FILL.DRAW_FULL) {//DrawPoint(Xpoint, Ypoint, GUI_BACKGROUND_COLOR, Line_width);
            while (XCurrent <= YCurrent) { //Realistic circles
                for (sCountY = XCurrent; sCountY <= YCurrent; sCountY++) {
                    DirectDrawPoint(X_Center + XCurrent, Y_Center + sCountY, Color, DOT_PIXEL.DOT_PIXEL_1);             //1
                    DirectDrawPoint(X_Center - XCurrent, Y_Center + sCountY, Color, DOT_PIXEL.DOT_PIXEL_1);             //2
                    DirectDrawPoint(X_Center - sCountY, Y_Center + XCurrent, Color, DOT_PIXEL.DOT_PIXEL_1);             //3
                    DirectDrawPoint(X_Center - sCountY, Y_Center - XCurrent, Color, DOT_PIXEL.DOT_PIXEL_1);             //4
                    DirectDrawPoint(X_Center - XCurrent, Y_Center - sCountY, Color, DOT_PIXEL.DOT_PIXEL_1);             //5
                    DirectDrawPoint(X_Center + XCurrent, Y_Center - sCountY, Color, DOT_PIXEL.DOT_PIXEL_1);             //6
                    DirectDrawPoint(X_Center + sCountY, Y_Center - XCurrent, Color, DOT_PIXEL.DOT_PIXEL_1);             //7
                    DirectDrawPoint(X_Center + sCountY, Y_Center + XCurrent, Color, DOT_PIXEL.DOT_PIXEL_1);
                }
                if (Esp < 0)
                    Esp += 4 * XCurrent + 6;
                else {
                    Esp += 10 + 4 * (XCurrent - YCurrent);
                    YCurrent--;
                }
                XCurrent++;
            }
        } else { //Draw a hollow circle
            while (XCurrent <= YCurrent) {
                DirectDrawPoint(X_Center + XCurrent, Y_Center + YCurrent, Color, Dot_Pixel);             //1
                DirectDrawPoint(X_Center - XCurrent, Y_Center + YCurrent, Color, Dot_Pixel);             //2
                DirectDrawPoint(X_Center - YCurrent, Y_Center + XCurrent, Color, Dot_Pixel);             //3
                DirectDrawPoint(X_Center - YCurrent, Y_Center - XCurrent, Color, Dot_Pixel);             //4
                DirectDrawPoint(X_Center - XCurrent, Y_Center - YCurrent, Color, Dot_Pixel);             //5
                DirectDrawPoint(X_Center + XCurrent, Y_Center - YCurrent, Color, Dot_Pixel);             //6
                DirectDrawPoint(X_Center + YCurrent, Y_Center - XCurrent, Color, Dot_Pixel);             //7
                DirectDrawPoint(X_Center + YCurrent, Y_Center + XCurrent, Color, Dot_Pixel);             //0

                if (Esp < 0)
                    Esp += 4 * XCurrent + 6;
                else {
                    Esp += 10 + 4 * (XCurrent - YCurrent);
                    YCurrent--;
                }
                XCurrent++;
            }
        }
    }

    //% blockId=DisString
    //% blockGap=8
    //% block="Show String|X %Xchar|Y %Ychar|char %ch|Color %Color"
    //% Xchar.min=1 Xchar.max=160 Ychar.min=1 Ychar.max=128 
    //% Color.min=0 Color.max=65535
    //% weight=100
    export function DisString(Xchar: number, Ychar: number, ch: string, Color: number): void {
        let Xpoint = Xchar;
        let Ypoint = Ychar;
        let Font_Height = 12;
        let Font_Width = 7;
        let ch_len = ch.length;
        let i = 0;
        for (i = 0; i < ch_len; i++) {
            let ch_asicc = ch.charCodeAt(i) - 32;//NULL = 32
            let Char_Offset = ch_asicc * 12;

            if ((Xpoint + Font_Width) > 160) {
                Xpoint = Xchar;
                Ypoint += Font_Height;
            }

            // If the Y direction is full, reposition to(Xstart, Ystart)
            if ((Ypoint + Font_Height) > 128) {
                Xpoint = Xchar;
                Ypoint = Ychar;
            }
            DisChar_1207(Xpoint, Ypoint, Char_Offset, Color);

            //The next word of the abscissa increases the font of the broadband
            Xpoint += Font_Width;
        }
    }

    //% blockId=DirectDisString
    //% blockGap=8
    //% block="Direct Show String|X %Xchar|Y %Ychar|char %ch|Color %Color"
    //% Xchar.min=1 Xchar.max=160 Ychar.min=1 Ychar.max=128 
    //% Color.min=0 Color.max=65535
    //% weight=100
    export function DirectDisString(Xchar: number, Ychar: number, ch: string, Color: number): void {
        let Xpoint = Xchar;
        let Ypoint = Ychar;
        let Font_Height = 12;
        let Font_Width = 7;
        let ch_len = ch.length;
        let i = 0;
        for (i = 0; i < ch_len; i++) {
            let ch_asicc = ch.charCodeAt(i) - 32;//NULL = 32
            let Char_Offset = ch_asicc * 12;

            if ((Xpoint + Font_Width) > 160) {
                Xpoint = Xchar;
                Ypoint += Font_Height;
            }

            // If the Y direction is full, reposition to(Xstart, Ystart)
            if ((Ypoint + Font_Height) > 128) {
                Xpoint = Xchar;
                Ypoint = Ychar;
            }
            DirectDisChar_1207(Xpoint, Ypoint, Char_Offset, Color);

            //The next word of the abscissa increases the font of the broadband
            Xpoint += Font_Width;
        }
    }


    //% blockId=DisNumber
    //% blockGap=8
    //% block="Show number|X %Xnum|Y %Ynum|number %num|Color %Color"
    //% Xnum.min=1 Xnum.max=160 Ynum.min=1 Ynum.max=128 
    //% Color.min=0 Color.max=65535
    //% weight=100
    export function DisNumber(Xnum: number, Ynum: number, num: number, Color: number): void {
        let Xpoint = Xnum;
        let Ypoint = Ynum;
        DisString(Xnum, Ynum, num + "", Color);
    }

    //% blockId=DirectDisNumber
    //% blockGap=8
    //% block="Direct Show number|X %Xnum|Y %Ynum|number %num|Color %Color"
    //% Xnum.min=1 Xnum.max=160 Ynum.min=1 Ynum.max=128 
    //% Color.min=0 Color.max=65535
    //% weight=100
    export function DirectDisNumber(Xnum: number, Ynum: number, num: number, Color: number): void {
        let Xpoint = Xnum;
        let Ypoint = Ynum;
        DirectDisString(Xnum, Ynum, num + "", Color);
    }

    function DisChar_1207(Xchar: number, Ychar: number, Char_Offset: number, Color: number): void {
        let Page = 0, Column = 0;
        let off = Char_Offset
        for (Page = 0; Page < 12; Page++) {
            for (Column = 0; Column < 7; Column++) {
                // ----- TODO: COMMENTED OUT ISSUE FOR NOW -----
                //if(Font12_Table[off] & (0x80 >> (Column % 8)))
                //    LCD_SetPoint(Xchar + Column, Ychar + Page, Color);

                //One pixel is 8 bits
                if (Column % 8 == 7)
                    off++;
            }// Write a line
            if (7 % 8 != 0)
                off++;
        }// Write all
    }

    function DirectDisChar_1207(Xchar: number, Ychar: number, Char_Offset: number, Color: number): void {
        let Page = 0, Column = 0;
        let off = Char_Offset
        for (Page = 0; Page < 12; Page++) {
            for (Column = 0; Column < 7; Column++) {
                if (Font12_Table[off] & (0x80 >> (Column % 8))) {
                    LCD_SetPoint(Xchar + Column, Ychar + Page, Color);
                    LCD_DirectSetPoint(Xchar + Column, Ychar + Page, Color);
                }
                //One pixel is 8 bits
                if (Column % 8 == 7)
                    off++;
            }// Write a line
            if (7 % 8 != 0)
                off++;
        }// Write all
    }

    //spi ram
    function SPIRAM_Set_Mode(mode: number): void {
        pins.digitalWritePin(DigitalPin.P2, 0);
        pins.spiWrite(SRAM_CMD_WRSR);
        pins.spiWrite(mode);
        pins.digitalWritePin(DigitalPin.P2, 1);
    }

    function SPIRAM_RD_Byte(Addr: number): number {
        let RD_Byte;
        pins.digitalWritePin(DigitalPin.P2, 0);
        pins.spiWrite(SRAM_CMD_READ);
        pins.spiWrite(0X00);
        pins.spiWrite(Addr >> 8);
        pins.spiWrite(Addr);
        RD_Byte = pins.spiWrite(0x00);
        pins.digitalWritePin(DigitalPin.P2, 1);

        return RD_Byte;
    }

    function SPIRAM_WR_Byte(Addr: number, Data: number): void {
        pins.digitalWritePin(DigitalPin.P2, 0);
        pins.spiWrite(SRAM_CMD_WRITE);
        pins.spiWrite(0X00);
        pins.spiWrite(Addr >> 8);
        pins.spiWrite(Addr);
        pins.spiWrite(Data);
        pins.digitalWritePin(DigitalPin.P2, 1);
    }

    function Swop_AB(Point1: number, Point2: number): void {
        let Temp = 0;
        Temp = Point1;
        Point1 = Point2;
        Point2 = Temp;
    }
}
