import pdfs from "../pdf/pdf.json";
import "./Doc.css";

export default function Doc() {
  return (
    <div className="doc-container">
      <h1 className="title">📚 Study Material</h1>

      <div className="pdf-grid">
        {pdfs.map((pdf) => (
          <div
            key={pdf.id}
            className="pdf-card"
            onClick={() =>
              window.open(
                `${window.location.origin}/${pdf.file}`,
                "_blank"
              )
            }
          >
            <div className="pdf-icon">📄</div>

            <div className="pdf-content">
              <h3>{pdf.name}</h3>
              <p>Click to view PDF</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}