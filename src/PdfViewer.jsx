import { useParams } from "react-router-dom";

function PdfViewer() {
  const { file } = useParams();

  return (
    <iframe
      src={`/pdf/${file}`}
      width="100%"
      height="1000px"
      title="PDF"
    />
  );
}

export default PdfViewer;