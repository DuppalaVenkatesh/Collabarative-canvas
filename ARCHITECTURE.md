Technical Architecture

1. Overview

The application utilizes an Event-Sourced Architecture. Rather than transmitting large image buffers, the system communicates granular "drawing events" (line segments). This significantly reduces bandwidth and allows for complex features like collaborative undo/redo.

2. The Source of Truth (Server-Side)

The Node.js server (server.js) maintains the master state using two primary data structures:

drawingHistory: An array of every stroke segment emitted by any client.

redoStack: A stack used to store segments popped during an "Undo" event.

Global Undo/Redo Mechanism

This project solves the challenge of global history management through a Full-Replay Strategy:

When an undo event is received, the server pops the last segment from drawingHistory.

The server broadcasts the updated history to all clients via io.emit('update-canvas').

Clients clear their local canvas and loop through the history array to re-render the board.

The redoStack is cleared whenever a user starts a new drawing to prevent historical branching conflicts.

3. Frontend Module Strategy

The client is architected to separate concerns, preventing "spaghetti code":

View Layer (canvas.js): Manages the HTML5 Canvas context. It is completely decoupled from the network; it merely dispatches CustomEvents (draw-event, mouse-position) when user input is detected.

Network Layer (websocket.js): Acts as the bridge. It translates local DOM events into Socket.io messages and converts incoming socket messages into canvas drawing commands.

State Layer (main.js): Maintains UI settings (active color, tool, width) and initializes the sub-modules.

4. Real-Time Performance

Coordinate Normalization: Using getBoundingClientRect(), coordinates are normalized relative to the canvas element rather than the viewport, ensuring accuracy across different screen resolutions.

Optimization: The canvas context is initialized with { desynchronized: true }, which bypasses certain browser compositor buffers to reduce input-to-render latency.

Context Isolation: Remote drawing logic uses ctx.save() and ctx.restore() to ensure that one user's brush settings (like the eraser mode) do not overwrite the local user's active settings.

5. Conflict Handling

Drawing conflicts are handled by the Sequential Ordering of the WebSocket server. Since Socket.io processes events in the order they arrive, the server assigns a definitive timeline to the strokes. Even if two users draw in the same area simultaneously, the canvas renders them according to the server's processed sequence.

6. UX Design Choices

Persistence: Upon connection, the init event "hydrates" the new user's canvas with the existing board history, ensuring they are not looking at a blank screen while others are mid-session.