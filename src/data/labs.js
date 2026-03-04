export const labs = [
  {
    id: 'metasploitable-2-lab',
    name: 'Metasploitable 2 Lab',
    slug: 'metasploitable-2-lab',
    type: 'vm',
    revision: '1.0',
    date: '2025-01',
    description: 'Isolated penetration testing environment for security research',
    writeupsUrl: 'https://lui-gi.github.io/shelnet-resources/writeups/viewer.html?doc=metasploitable-2.txt',
    host: {
      name: 'Thinkpad P53',
      ram: '64GB',
      cpu: 'Intel Core i7-9850H'
    },
    hypervisor: 'QEMU/KVM',
    vms: [
      { name: 'Kali Linux', role: 'Attacker', ram: '8GB', cpu: '4 cores', network: 'external' },
      { name: 'pfSense', role: 'Firewall', ram: '2GB', cpu: '2 cores', network: 'bridge' },
      { name: 'Metasploitable 2', role: 'Target', ram: '2GB', cpu: '2 cores', network: 'isolated' }
    ],
    docs: {
      overview: {
        summary: 'Isolated penetration testing environment built on QEMU/KVM, replicating a segmented corporate network with an external attacker, an internal firewall, and a deliberately vulnerable target. The lab develops hands-on proficiency in the full exploitation lifecycle: reconnaissance, service enumeration, vulnerability identification, exploitation, and post-exploitation persistence.',
        objectives: [
          'Perform host discovery and port scanning through a firewalled network segment',
          'Enumerate and exploit known CVEs in unpatched services (vsftpd, Samba, UnrealIRCd)',
          'Execute post-exploitation techniques: credential harvesting, privilege escalation, pivoting',
          'Analyze firewall rule interactions and network segmentation effectiveness'
        ]
      },
      setup: [
        { item: 'Hypervisor',        detail: 'QEMU/KVM + libvirt',     notes: 'Kernel-based virtualization on Fedora host' },
        { item: 'Kali Linux VM',     detail: '8 GB RAM · 4 vCPUs',     notes: 'Bridged to host network — 192.168.1.x' },
        { item: 'pfSense VM',        detail: '2 GB RAM · 2 vCPUs',     notes: 'Dual-NIC: WAN → host bridge, LAN → 192.168.100.1/24' },
        { item: 'Metasploitable 2',  detail: '2 GB RAM · 2 vCPUs',     notes: 'Isolated LAN only — 192.168.100.10' },
        { item: 'Network Topology',  detail: 'NAT + isolated bridge',  notes: 'virbr0 (host) → pfSense → virbr1 (isolated)' }
      ],
      workflow: [
        { step: 1, title: 'Host Discovery',      body: 'Run nmap -sn 192.168.100.0/24 from Kali to locate live hosts on the isolated segment through the pfSense NAT gateway. MS2 responds at 192.168.100.10.' },
        { step: 2, title: 'Service Enumeration', body: 'Run nmap -sV -sC -p- against MS2. Key findings: vsftpd 2.3.4 (port 21), Samba 3.x (ports 139/445), Apache 2.2 with DVWA (port 80), UnrealIRCd (port 6667), distcc (port 3632).' },
        { step: 3, title: 'Initial Exploitation', body: 'Use Metasploit module exploit/unix/ftp/vsftpd_234_backdoor against port 21. The backdoor triggers a root shell on port 6200 when a smiley face (:)) is appended to the username, yielding immediate root access.' },
        { step: 4, title: 'Post-Exploitation',   body: 'Dump /etc/shadow via the root shell. Crack weak hashes offline with John the Ripper (rockyou.txt). Identify SUID binaries: /usr/bin/nmap --interactive provides an alternative root escalation path from non-root footholds.' },
        { step: 5, title: 'Lateral Movement',    body: 'Access DVWA via browser through the pfSense port-forward. Exploit SQL injection to dump the MySQL user table. Exploit distcc on port 3632 with exploit/unix/misc/distcc_exec for a second remote code execution path.' }
      ],
      findings: [
        { title: 'vsftpd 2.3.4 Backdoor (CVE-2011-2523)', body: 'Trivially exploitable with a single Metasploit module — yields a root shell directly. Demonstrates the supply-chain impact of a malicious commit shipped in a widely-deployed daemon.' },
        { title: 'pfSense Segmentation Bypassed via NAT Misconfiguration', body: 'Default firewall rules allowed Kali to reach MS2 via a port-forward added for convenience. Highlights how lab-specific configurations can silently undermine the intended security boundary.' },
        { title: 'Default Credential Exposure', body: 'PostgreSQL accessible with postgres:postgres. MySQL and DVWA also used trivially guessable passwords, demonstrating the systemic risk of shipping services with default credentials.' },
        { title: 'SUID Nmap Privilege Escalation', body: '/usr/bin/nmap with the --interactive flag spawns a root shell from any user context. SUID on a non-essential diagnostic tool is a common misconfiguration in older Linux deployments.' }
      ]
    }
  },
  {
    id: 'pcb-hid-implant-lab',
    name: 'PCB Hardware Implant Lab',
    slug: 'pcb-hid-implant-lab',
    type: 'hardware',
    revision: '1.0',
    date: '2025-03',
    description: 'RP2040-based rogue HID device research and USB implant analysis',
    writeupsUrl: 'https://lui-gi.github.io/shelnet-resources/writeups/viewer.html?doc=rp2040-hid-implant.txt',
    host: {
      name: 'RP2040 Dev Platform',
      platform: 'CircuitPython / bare metal',
      interface: 'USB HID'
    },
    components: [
      { name: 'RP2040 PCB',      role: 'Implant', spec: 'Dual-core ARM M0+, 264KB SRAM', interface: 'USB HID'  },
      { name: 'ThinkPad P53',    role: 'Victim',  spec: '64GB RAM, i7-9850H',             interface: 'USB 3.0' },
      { name: 'Monitoring Host', role: 'Monitor', spec: 'Wireshark / USBPcap',             interface: 'USB 3.0' }
    ],
    docs: {
      overview: {
        summary: 'Physical attack surface research platform built around an RP2040 microcontroller programmed to emulate a USB HID keyboard. When inserted into a victim machine, the implant autonomously injects a keystroke payload that opens a reverse shell. A dedicated monitoring host captures the full USB enumeration and keystroke stream via USBPcap for timing analysis and protocol fingerprinting.',
        objectives: [
          'Implement USB HID firmware on RP2040 using the CircuitPython adafruit_hid library',
          'Measure plug-to-execution latency and optimize keystroke injection timing',
          'Analyze USB descriptor fingerprinting to assess detectability against endpoint protection tools',
          'Capture and decode USB HID report traffic at the protocol level with Wireshark + USBPcap'
        ]
      },
      setup: [
        { item: 'RP2040 PCB',          detail: 'CircuitPython 8.x + adafruit_hid 6.x',  notes: 'Flashed via USB drag-and-drop UF2; payload in code.py' },
        { item: 'Victim Host',          detail: 'ThinkPad P53 · Windows 11 22H2',         notes: 'Windows Defender active; no USB device policy enforcement' },
        { item: 'Monitoring Host',      detail: 'Wireshark 4.x + USBPcap 1.5.x',         notes: 'USBPcap driver tapped on victim USB controller interface' },
        { item: 'Payload',              detail: 'PowerShell reverse shell · 50 ms/key',   notes: 'Base64-encoded to avoid shell meta-character drops' },
        { item: 'Reverse Shell Listener', detail: 'ncat on attacker host · TCP 4444',     notes: 'LAN-local listener; NAT traversal out of scope for this revision' }
      ],
      workflow: [
        { step: 1, title: 'Firmware Setup',         body: 'Flash CircuitPython UF2 onto the RP2040. Copy the adafruit_hid library bundle into /lib. Write code.py: import Keyboard and KeyboardLayoutUS, add a 5-second boot delay to allow OS enumeration to complete, then begin keystroke injection.' },
        { step: 2, title: 'Payload Development',    body: 'Build a PowerShell reverse shell one-liner and base64-encode the body. Use keyboard.write() for printable characters and keyboard.send() for control sequences (WIN key, ENTER). Rate-limit to 50 ms between keystrokes to prevent character drops.' },
        { step: 3, title: 'USB Capture Setup',      body: 'Install USBPcap on the monitoring host. Select the victim USB controller interface in Wireshark. Start capture before inserting the implant to record the full enumeration sequence: GET_DESCRIPTOR, SET_ADDRESS, SET_CONFIGURATION.' },
        { step: 4, title: 'Implant Insertion',      body: 'Insert the RP2040 into the victim USB port. Windows auto-installs the HID keyboard class driver (1–2 seconds). After the firmware boot delay, injection begins: WIN+R → powershell → payload → ENTER. Measure elapsed time to reverse shell callback.' },
        { step: 5, title: 'Traffic Analysis',       body: 'Review the Wireshark capture: inspect HID report descriptors in GET_DESCRIPTOR responses, verify 8-byte boot-protocol keyboard reports during injection, and measure inter-report timing. Export as PCAP for offline review.' }
      ],
      findings: [
        { title: 'HID Enumeration Indistinguishable from Commercial Keyboards', body: 'USB descriptor (VID/PID, HID report descriptor, device class 0x03) matches the structure of off-the-shelf keyboards. Windows Device Manager shows "USB Input Device" with no anomalous attributes. No EDR alert triggered during enumeration.' },
        { title: 'Plug-to-Execution Latency: 4.2 s Average', body: 'OS enumeration takes 1–2 s; firmware boot delay adds 5 s (configurable); keystroke injection for the full payload takes ~3 s at 50 ms/key. Reducing payload length and boot delay can bring total latency under 5 seconds.' },
        { title: 'Keystroke Rate Sensitivity', body: 'At 20 ms inter-keystroke delay, Windows dropped ~8% of characters. At 50 ms, zero drops were observed across 20 test insertions. Optimal rate is system-dependent — injecting too fast silently corrupts the injected command.' },
        { title: 'Windows Defender Blind Window', body: 'The reverse shell payload executed before Defender real-time scanning processed the PowerShell invocation. Base64 encoding bypassed the initial pattern-match scan. Persistence mechanisms (registry run keys) were flagged on subsequent scans.' }
      ]
    }
  },
  {
    id: 'fpga-logic-analyzer-lab',
    name: 'FPGA Logic Analyzer Lab',
    slug: 'fpga-logic-analyzer-lab',
    type: 'hardware',
    revision: '1.0',
    date: '2025-09',
    description: 'Artix-7 FPGA-based 8-channel logic analyzer implemented in Verilog HDL',
    writeupsUrl: 'https://lui-gi.github.io/shelnet-resources/writeups/viewer.html?doc=fpga-logic-analyzer.txt',
    host: {
      name: 'Digilent Arty A7-35T',
      platform: 'Xilinx Vivado 2023.2 / Verilog',
      interface: 'JTAG / USB-UART'
    },
    components: [
      { name: 'Arty A7-35T',   role: 'Analyzer',    spec: 'Artix-7 XC7A35T · 33K LUTs · 1.8 MB BRAM',  interface: 'JTAG'     },
      { name: 'STM32F4 Board', role: 'Environment',  spec: 'Cortex-M4 · SPI/I2C/UART signal source',    interface: 'GPIO'     },
      { name: 'Analysis Host', role: 'Monitor',      spec: 'Python 3 + GTKWave · 16 GB RAM',             interface: 'USB-UART' }
    ],
    docs: {
      overview: {
        summary: 'Custom 8-channel logic analyzer built from scratch in Verilog HDL on a Digilent Arty A7-35T FPGA development board. The design implements a finite state machine-driven capture engine, a BRAM circular buffer for sample storage, and a UART transmit module to stream captured digital waveforms to a host PC at 115200 baud. A Python post-processing script decodes the serial stream and exports standard VCD files for waveform inspection in GTKWave. The target signal source is an STM32F4 microcontroller emitting SPI, I2C, and UART transactions to validate the analyzer against known protocol patterns.',
        objectives: [
          'Design and synthesize a synchronous FSM-based capture engine in Verilog targeting a Xilinx Artix-7 device',
          'Implement an 8-channel BRAM circular buffer with configurable depth and trigger-based capture windowing',
          'Build a UART TX module (115200 baud, 8N1) to stream captured sample frames to a host PC',
          'Write Xilinx Design Constraint (XDC) files for I/O pin assignment and timing closure at 100 MHz'
        ]
      },
      setup: [
        { item: 'Arty A7-35T',        detail: 'Artix-7 XC7A35T · 33K LUTs · 1.8 MB BRAM',           notes: 'Digilent USB-JTAG programmer onboard; no external hardware required' },
        { item: 'Vivado 2023.2',       detail: 'Synthesis · implementation · bitstream generation',    notes: 'Free WebPACK edition; supports Artix-7 without license' },
        { item: 'STM32F4 Discovery',   detail: 'Cortex-M4 @ 168 MHz · STM32CubeIDE firmware',         notes: 'Emits SPI @ 1 MHz, I2C @ 400 kHz, UART @ 9600 baud on breakout headers' },
        { item: 'Python 3 + pyserial', detail: 'Host-side UART capture and VCD export',               notes: 'Reads 9-byte frames (1 header + 8 channel bytes) from /dev/ttyUSB1' },
        { item: 'GTKWave 3.3.x',       detail: 'VCD waveform viewer',                                 notes: 'Validates captured waveforms against STM32 firmware timing' }
      ],
      workflow: [
        { step: 1, title: 'Project Setup & Clock Constraints',  body: 'Create a Vivado project targeting the XC7A35T-CSG324 package. Import the Arty A7 master XDC. Add a clock constraint of 10 ns (100 MHz) on the sys_clk net. Confirm the on-board MMCM is unused — the native oscillator is stable enough for this design.' },
        { step: 2, title: 'Capture FSM Design',                 body: 'Implement a 3-state FSM in Verilog: IDLE (waiting for trigger), CAPTURE (sampling all 8 channels on every rising clock edge into a write port), TRANSMIT (feeding samples to the UART TX FIFO). Trigger on a configurable rising or falling edge on channel 0.' },
        { step: 3, title: 'BRAM Circular Buffer',               body: 'Instantiate a Vivado IP Block Memory Generator (simple dual-port, FIFO mode). Write port clocked at 100 MHz (capture clock), read port serviced by the UART TX state machine. Set buffer depth to 4096 × 8-bit samples (32 KB — well within the 1.8 MB BRAM budget).' },
        { step: 4, title: 'UART TX Module',                     body: 'Write a 16× oversampled UART transmitter in Verilog (baud divider = 100,000,000 / 115200 ≈ 868 cycles). Serialize each 8-bit sample with 1 start bit, 8 data bits, 1 stop bit (8N1). Assert tx_busy to stall the BRAM read port during inter-frame gaps.' },
        { step: 5, title: 'Synthesis, Implementation & Timing', body: 'Run synthesis and implementation in Vivado. Inspect the timing report — the combinatorial path from BRAM read data to UART shift register exceeded 10 ns on the first pass. Add a single pipeline register on the BRAM output to close timing. Verify utilization: < 2% LUTs, < 3% BRAM, timing met with 0.8 ns positive slack.' }
      ],
      findings: [
        { title: '100 MHz Capture Rate Achieved Within Timing Constraints',       body: 'Post-implementation timing report confirmed a worst-case slack of +0.8 ns on the critical path (BRAM read → UART shift register). A single pipeline register resolved the combinatorial path violation present in the initial synthesis pass. Final LUT utilization: 287 of 20,800 (1.4%).' },
        { title: 'BRAM Circular Buffer Eliminates Sample Loss During Burst Captures', body: 'The 4096-sample BRAM FIFO absorbed all 8-channel data during a 40 µs SPI burst at 1 MHz (40 samples) with 0% overflow. FIFO occupancy never exceeded 2%. For longer captures, a dual-buffer ping-pong scheme is recommended to prevent head-tail collision.' },
        { title: 'UART Streaming Bottleneck Requires Post-Capture Mode',          body: 'At 115200 baud, streaming one 8-bit sample requires 86.8 µs — over 8,000× slower than the 10 ns capture clock. Real-time streaming is infeasible. Post-capture mode (fill BRAM, then drain over UART) caps the capture window at 40.96 µs — sufficient for short protocol frames such as SPI transactions.' },
        { title: 'VCD Export Validates Waveforms Against STM32 SPI Firmware',     body: 'Python script decoded the 9-byte frame stream and generated a VCD file. GTKWave displayed SPI SCK, MOSI, MISO, and CS channels with correct 1 MHz timing. Cross-referencing with STM32CubeIDE confirmed zero-sample timing error — the Artix-7 capture engine introduced no observable jitter at 100 MHz.' }
      ]
    }
  },
  {
    id: 'sdr-rf-recon-lab',
    name: 'SDR RF Recon Lab',
    slug: 'sdr-rf-recon-lab',
    type: 'hardware',
    revision: '1.0',
    date: '2025-06',
    description: 'RTL-SDR passive RF reconnaissance and signal analysis environment',
    writeupsUrl: 'https://lui-gi.github.io/shelnet-resources/writeups/viewer.html?doc=sdr-rf-recon.txt',
    host: {
      name: 'GNU Radio Workstation',
      platform: 'GNU Radio 3.10',
      interface: 'USB 3.0'
    },
    components: [
      { name: 'RTL-SDR v3',     role: 'Sensor',      spec: '500kHz–1.75GHz, 8-bit ADC',  interface: 'USB 3.0' },
      { name: 'GNU Radio Host', role: 'Analyzer',    spec: '16GB RAM, GRC flowgraphs',    interface: 'USB 3.0' },
      { name: 'RF Environment', role: 'Environment', spec: 'Passive / live RF spectrum',  interface: 'Antenna' }
    ],
    docs: {
      overview: {
        summary: 'Passive RF reconnaissance environment using a low-cost RTL-SDR v3 dongle and GNU Radio 3.10 to survey, capture, and decode live radio frequency transmissions. Operating entirely in receive-only mode, the lab builds skills in spectrum analysis, flowgraph-based signal processing, and protocol reverse engineering across the 433 MHz, 868 MHz, and 915 MHz ISM bands.',
        objectives: [
          'Survey the local RF environment with GQRX to identify active transmitters and characterize signal parameters',
          'Build GNU Radio Companion flowgraphs for real-time NBFM demodulation and IQ file capture',
          'Decode OOK/FSK protocol frames from ISM-band sensors using Universal Radio Hacker',
          'Calibrate RTL-SDR frequency offset and validate sample rate stability at 2.048 MSPS on USB 3.0'
        ]
      },
      setup: [
        { item: 'RTL-SDR v3',          detail: '500 kHz–1.75 GHz · 8-bit ADC · R820T2', notes: 'Disable kernel DVB driver: blacklist dvb_usb_rtl28xxu' },
        { item: 'GNU Radio Host',       detail: 'GNU Radio 3.10 · gr-osmosdr · rtl-sdr 0.6.0', notes: '16 GB RAM; USB 3.0 port required for 2.048 MSPS stable' },
        { item: 'Antenna',              detail: '1/4-wave whip · SMA connector',         notes: 'Tuned for 433 MHz; indoor, 2 m elevation' },
        { item: 'GQRX',                 detail: 'GQRX SDR 2.17',                         notes: 'Wideband survey and real-time waterfall visualization' },
        { item: 'Universal Radio Hacker', detail: 'URH 2.9.x',                           notes: 'IQ file import, signal demodulation, protocol analysis' }
      ],
      workflow: [
        { step: 1, title: 'Driver Setup & Calibration', body: 'Blacklist the kernel DVB-T driver (echo "blacklist dvb_usb_rtl28xxu" >> /etc/modprobe.d/blacklist.conf). Run rtl_test -p to measure PPM frequency offset (typically 25–50 ppm uncalibrated). Apply correction in both GQRX and the GRC RTL-SDR source block.' },
        { step: 2, title: 'Wideband Survey',            body: 'Open GQRX with center frequency 433.92 MHz, sample rate 2.048 MSPS. Enable waterfall display. Step through 300–900 MHz logging every active signal: frequency, bandwidth (−3 dB), estimated modulation, duty cycle, and RSSI.' },
        { step: 3, title: 'NBFM Demodulation Flowgraph', body: 'In GNU Radio Companion: RTL-SDR Source → Low-pass Filter (cutoff 100 kHz, transition 25 kHz) → Rational Resampler (decimation 20) → NBFM Receive (audio rate 48 kHz, max deviation 5 kHz) → Audio Sink. Verify audio output on a local FM repeater.' },
        { step: 4, title: 'ISM Band IQ Capture',        body: 'Tune to 433.92 MHz. Add a File Sink to the GRC flowgraph to capture 30-second IQ samples at 250 kSPS (complex float32, .iq). Trigger when the waterfall shows an OOK burst. Capture at least 10 complete transmissions.' },
        { step: 5, title: 'Protocol Reverse Engineering', body: 'Import the .iq file into Universal Radio Hacker. Set demodulation to OOK — URH auto-detects signal center. Inspect the decoded bit stream: identify preamble, sync word, and payload fields. Cross-compare multiple captures to isolate device ID and sensor data.' }
      ],
      findings: [
        { title: '12 Active ISM Transmitters Identified (433 MHz)', body: 'Wideband survey detected 12 unique transmitters within the 433.05–434.79 MHz allocation. RSSI ranged from −65 to −92 dBm. Transmission patterns included periodic sensor beacons (10–60 s interval) and event-driven remote controls.' },
        { title: 'Weather Station Protocol Fully Decoded', body: 'A neighboring wireless weather station at 433.92 MHz was reverse-engineered: OOK modulation, 2400 bps, 36-bit frame — 8-bit preamble, 8-bit device ID, 12-bit temperature (0.1 °C resolution), 8-bit checksum. Decoded after 3 sample captures in URH.' },
        { title: 'RTL-SDR Frequency Error: 42 PPM', body: 'rtl_test -p measured a 42 PPM offset. Uncorrected, this causes ~18 kHz error at 433 MHz — enough to miss narrowband FSK signals with less than 25 kHz deviation. Post-correction, FM broadcast stations tuned accurately.' },
        { title: '868 MHz LoRa Activity Detected', body: 'Periodic chirp spread-spectrum transmissions observed at 868.1 MHz (EU868 band). Characteristic linear frequency sweep visible on waterfall. Likely smart meter or building automation traffic. LoRa decoding is planned for a future lab revision.' }
      ]
    }
  }
];
