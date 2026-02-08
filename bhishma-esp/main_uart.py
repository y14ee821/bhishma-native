from machine import UART,Pin
a = Pin(5,Pin.OUT)
import uos

import time
ch =''
while True:      
    uos.dupterm(None, 1)
    uart = UART(0, 115200)
    if uart.any():
        ch = uart.read()
        uart.write("op1:1-op2:0-op3:1-op4:0-op5:1")
        #uos.dupterm(UART(0, 115200), 1)
        
        uos.dupterm(UART(0, 115200), 1)
        print(ch)
        if(uart.read() == b'Hel'):
         a.on()
        else:
           a.off()
        
    time.sleep(0.05)
