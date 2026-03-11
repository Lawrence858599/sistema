from pathlib import Path
path = Path('frontend/styles.css')
text = path.read_text()
addition = "\n.detail-topbar {\n  margin-top: 20px;\n  flex-wrap: wrap;\n  gap: 16px;\n}\n\n.detail-page {\n  display: grid;\n  gap: 22px;\n}\n\n.detail-summary .detail-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));\n  gap: 16px;\n}\n\n.detail-description p {\n  line-height: 1.6;\n  color: var(--muted-soft);\n  font-size: 1rem;\n}\n\n.detail-history .history-list {\n  list-style: none;\n  padding: 0;\n  margin: 0;\n  display: grid;\n  gap: 12px;\n}\n\n.history-list li {\n  display: flex;\n  justify-content: space-between;\n  background: var(--surface-alt);\n  padding: 12px 16px;\n  border-radius: 12px;\n  border: 1px solid var(--border);\n  font-size: 0.95rem;\n}\n\n.detail-gallery-section .modal-gallery {\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n}\n"
path.write_text(text + addition)
