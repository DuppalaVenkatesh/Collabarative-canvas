Collaborative Real-Time Whiteboard

A high-performance, multi-user drawing application built with Vanilla JavaScript and Node.js. This project features real-time synchronization, global undo/redo capabilities, and live user indicators, simulating a professional collaboration tool like Miro.

🚀 Features

Real-Time Synchronization: View strokes from other users as they happen with sub-millisecond latency.

Global Undo/Redo: Collaborative history management where any user can undo or redo the last action on the shared canvas.

User Presence: Live cursor indicators displaying the position and unique auto-assigned color of every connected user.

Dynamic Toolbox: - Brush Tool: Smooth variable-width drawing.

Eraser Tool: Precision erasing using destination-out composite operations.

Color Palette: Custom color picker and quick-select swatches.

Responsive Canvas: Automatic resizing that preserves drawing state using ImageData buffering.

Polished UI: Tactile feedback with CSS bounce animations and FontAwesome iconography.

🛠️ Tech Stack

Frontend: Vanilla JavaScript (ES Modules), HTML5 Canvas API, CSS3.

Backend: Node.js, Express.

Real-Time Engine: Socket.io for event-based bi-directional communication.

📦 Installation & Setup

Clone the repository:

git clone <your-repo-url>
cd collabarative-canvas


Install dependencies:

npm install


Start the server:

npm run dev


Access the application:
Open http://localhost:3000 in multiple browser windows to test the real-time collaboration.

🤝 Core Requirements Implemented

[x] Drawing tools (Brush, Eraser, Multiple colors, Adjustable width).

[x] Real-time synchronization while drawing is in progress.

[x] User indicators (Cursor tracking).

[x] Conflict handling via server-side event ordering.

[x] Global Undo/Redo functionality.

[x] Unique color assignment per session.