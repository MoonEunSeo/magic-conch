// utils/saveImage.js
export async function saveConchImage(question, answer) {
    const baseImage = new Image();
    baseImage.crossOrigin = "anonymous"; // CORS 허용 (cdn/static 환경일 경우)
    baseImage.src = "/download_graph.png"; // public 폴더 기준
  
    baseImage.onload = () => {
      const width = 1824;
      const height = 1237;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
  
      // 1️⃣ 배경 이미지 고정 크기로 그림
      ctx.drawImage(baseImage, 0, 0, width, height);
  
      // 2️⃣ 텍스트 스타일 정의
      ctx.font = "bold 60px 'Paperlogy-7', sans-serif";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 8;
  
      // 3️⃣ 질문 (상단 중앙)
      const qLines = wrapText(ctx, question, width - 200);
      drawMultiline(ctx, qLines, width / 2, 200, 80);
  
      // 4️⃣ 답변 (하단 중앙)
      ctx.font = "bold 72px 'Paperlogy-7', sans-serif";
      ctx.fillStyle = "#FFE57F";
      const aLines = wrapText(ctx, answer, width - 300);
      drawMultiline(ctx, aLines, width / 2, 850, 90);
  
      // 5️⃣ 다운로드 처리
      const imageURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imageURL;
      link.download = "magic-conch-result.png";
      link.click();
    };
  }
  
  /** 긴 문장을 줄바꿈 처리 */
  function wrapText(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];
  
    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + " " + words[i];
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  }
  
  /** 여러 줄 텍스트 그리기 */
  function drawMultiline(ctx, lines, x, startY, lineHeight) {
    lines.forEach((line, i) => {
      ctx.fillText(line, x, startY + i * lineHeight);
    });
  }
  