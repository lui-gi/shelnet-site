import { useEffect, useRef } from 'react';

const LabTopologyCanvas = ({ vms, hypervisor }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const roleColors = {
      Attacker: { r: 248, g: 113, b: 113 },  // red-400
      Firewall: { r: 96, g: 165, b: 250 },    // blue-400
      Target: { r: 74, g: 222, b: 128 },       // green-400
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    // Helper: rounded rect
    const roundRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    // Helper: dashed rect
    const dashedRect = (x, y, w, h) => {
      ctx.beginPath();
      ctx.setLineDash([6, 4]);
      ctx.rect(x, y, w, h);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // Helper: corner markers
    const drawCorners = (w, h) => {
      const len = 18;
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.5)';
      ctx.lineWidth = 2;
      // top-left
      ctx.beginPath(); ctx.moveTo(0, len); ctx.lineTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();
      // top-right
      ctx.beginPath(); ctx.moveTo(w - len, 0); ctx.lineTo(w, 0); ctx.lineTo(w, len); ctx.stroke();
      // bottom-left
      ctx.beginPath(); ctx.moveTo(0, h - len); ctx.lineTo(0, h); ctx.lineTo(len, h); ctx.stroke();
      // bottom-right
      ctx.beginPath(); ctx.moveTo(w - len, h); ctx.lineTo(w, h); ctx.lineTo(w, h - len); ctx.stroke();
    };

    // Point along a line at t (0-1)
    const lerp = (x1, y1, x2, y2, t) => ({
      x: x1 + (x2 - x1) * t,
      y: y1 + (y2 - y1) * t,
    });

    const draw = (time) => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;

      ctx.clearRect(0, 0, w, h);

      // -- Host machine outer rect --
      const hostPad = 16;
      roundRect(hostPad, hostPad, w - hostPad * 2, h - hostPad * 2, 6);
      ctx.fillStyle = 'rgba(251, 146, 60, 0.05)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // -- Hypervisor label --
      const hypText = `[${hypervisor}]`;
      ctx.font = '12px monospace';
      const hypW = ctx.measureText(hypText).width + 20;
      const hypX = w / 2 - hypW / 2;
      const hypY = hostPad + 16;
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(hypX, hypY, hypW, 24);
      ctx.fillStyle = 'rgba(251, 146, 60, 0.08)';
      ctx.fillRect(hypX, hypY, hypW, 24);
      ctx.fillStyle = 'rgba(251, 146, 60, 0.9)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hypText, w / 2, hypY + 12);

      // -- Layout positions --
      // Isolated network boundary
      const isoX = w * 0.38;
      const isoY = hypY + 50;
      const isoW = w * 0.52;
      const isoH = h - isoY - hostPad - 30;

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 1;
      dashedRect(isoX, isoY, isoW, isoH);

      // Isolated network label
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('ISOLATED NETWORK', isoX + 8, isoY + 6);

      // -- VM node positions --
      const nodeW = Math.min(140, w * 0.2);
      const nodeH = 70;

      // Kali: bottom-left, outside isolated boundary
      const kaliX = hostPad + 20;
      const kaliY = isoY + isoH / 2 - nodeH / 2;

      // pfSense: inside isolated, top area
      const pfX = isoX + isoW / 2 - nodeW / 2;
      const pfY = isoY + 28;

      // Metasploitable: inside isolated, bottom area
      const msX = isoX + isoW / 2 - nodeW / 2;
      const msY = isoY + isoH - nodeH - 14;

      const glowPhase = (Math.sin(time / 1000) + 1) / 2; // 0-1, ~2s
      const glowBlur = 3 + glowPhase * 9;

      const vmData = [
        { vm: vms.find(v => v.role === 'Attacker') || vms[0], x: kaliX, y: kaliY, color: roleColors.Attacker },
        { vm: vms.find(v => v.role === 'Firewall') || vms[1], x: pfX, y: pfY, color: roleColors.Firewall },
        { vm: vms.find(v => v.role === 'Target') || vms[2], x: msX, y: msY, color: roleColors.Target },
      ];

      // -- Connection lines --
      const connections = [
        { from: vmData[0], to: vmData[1] }, // Kali -> pfSense
        { from: vmData[1], to: vmData[2] }, // pfSense -> Metasploitable
      ];

      connections.forEach(({ from, to }) => {
        const x1 = from.x + nodeW / 2;
        const y1 = from.y + nodeH / 2;
        const x2 = to.x + nodeW / 2;
        const y2 = to.y + nodeH / 2;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Pulsing dot
        const dotT = ((time / 3000) % 1);
        const dot = lerp(x1, y1, x2, y2, dotT);
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251, 146, 60, 0.9)';
        ctx.fill();
      });

      // -- "ATTACK VECTOR" label --
      const avX = (kaliX + nodeW + isoX) / 2;
      const avY = kaliY + nodeH / 2;
      ctx.save();
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = 'rgba(248, 113, 113, 0.6)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ATTACK', avX, avY - 6);
      ctx.fillText('VECTOR', avX, avY + 6);
      ctx.restore();

      // -- Draw VM nodes --
      vmData.forEach(({ vm, x, y, color }) => {
        const rgba = (a) => `rgba(${color.r}, ${color.g}, ${color.b}, ${a})`;

        ctx.save();
        ctx.shadowColor = rgba(0.6);
        ctx.shadowBlur = glowBlur;

        // Node box
        roundRect(x, y, nodeW, nodeH, 4);
        ctx.fillStyle = rgba(0.08);
        ctx.fill();
        ctx.strokeStyle = rgba(0.6);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Role label
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = rgba(0.7);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(vm.role.toUpperCase(), x + nodeW / 2, y + 8);

        // VM name
        ctx.font = '11px monospace';
        ctx.fillStyle = rgba(1);
        ctx.fillText(vm.name, x + nodeW / 2, y + 24);

        // Specs
        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillText(`${vm.ram} / ${vm.cpu}`, x + nodeW / 2, y + 42);

        ctx.restore();
      });

      // -- Corner markers --
      drawCorners(w, h);

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [vms, hypervisor]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[280px] sm:min-h-[350px]">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default LabTopologyCanvas;
