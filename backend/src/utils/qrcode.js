function makeTicketCode(slotId) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SP-${slotId}-${Date.now().toString(36).toUpperCase()}-${random}`;
}

function makePseudoQr(ticketCode) {
  const cells = 13;
  let seed = 0;

  for (const char of ticketCode) {
    seed = (seed * 31 + char.charCodeAt(0)) % 9973;
  }

  let rects = "";
  for (let y = 0; y < cells; y += 1) {
    for (let x = 0; x < cells; x += 1) {
      const finder =
        (x < 4 && y < 4) ||
        (x > cells - 5 && y < 4) ||
        (x < 4 && y > cells - 5);
      const filled = finder || ((x * 17 + y * 23 + seed) % 5 < 2);
      if (filled) {
        rects += `<rect x="${x}" y="${y}" width="1" height="1" />`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cells} ${cells}" shape-rendering="crispEdges"><rect width="${cells}" height="${cells}" fill="#fff"/><g fill="#111827">${rects}</g></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

module.exports = {
  makeTicketCode,
  makePseudoQr,
};
