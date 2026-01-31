Technical Architecture: Collaborative Canvas

1. Data Flow Diagram

The application follows a Uni-directional Event-Sourced data flow. Instead of sharing a massive image buffer, we share the intent (the stroke) and let each client render it locally.

[User A (Mouse Move)] 
      |
      v
[canvas.js (getCoordinates)] -> [Dispatch local 'draw-event']
      |
      v
[websocket.js (socket.emit('draw'))] 
      |
      v
[server.js (socket.broadcast.emit('on-draw'))] -> [Push to drawingHistory]
      |
      v
[User B (socket.on('on-draw'))]
      |
      v
[websocket.js (drawRemote)] -> [Canvas API (stroke)]


2. WebSocket Protocol

We utilize Socket.io for bi-directional, low-latency communication.

Message Formats & Events

Event Name

Direction

Payload Structure

Description

init

Server -> Client

{ history: Array, users: Object }

Sent on connection to sync the current state.

draw

Client -> Server

{ from: {x,y}, to: {x,y}, settings: {} }

Emitted every frame while the mouse is moving.

on-draw

Server -> Client

Same as draw

Broadcasted to all other users to render the stroke.

mouse-move

Client -> Server

{ x: Number, y: Number }

Emitted to update the user's cursor position.

undo / redo

Client -> Server

void

Triggers global history manipulation.

update-canvas

Server -> Client

Array (drawingHistory)

Commands all clients to wipe and redraw the board.

3. Undo / Redo Strategy

The "Intentionally Difficult" global undo/redo is handled through a Full-Replay System:

Stacks: The server maintains a drawingHistory stack and a redoStack.

The Logic: When a user clicks Undo, the server pops the last segment from the history and moves it to the redo stack.

Synchronization: The server then sends the entire updated history to every client.

Client Rendering: Clients clear their 2D context using clearRect() and iterate through the history array, re-drawing every segment using the drawRemote function.

Conflict Prevention: The redoStack is cleared whenever any user performs a new draw action, preventing historical branching.

4. Performance Decisions

desynchronized: true: In canvas.js, the 2D context is initialized with this flag. It hints to the browser to bypass the compositor's double-buffering, significantly reducing input lag for the drawer.

Normalized Coordinates: We use getBoundingClientRect() to calculate offsets. This ensures that even if the CSS layout shifts or the window is resized, the $(x, y)$ coordinates remain accurate relative to the canvas origin $(0,0)$.

ImageData Buffering: During window resizes, we use getImageData and putImageData to prevent the browser from wiping the user's current drawing when the canvas internal resolution changes.

Hardware Acceleration: Animations (like the button bounce) are handled via CSS transform and opacity to ensure they run on the GPU, keeping the main thread free for drawing calculations.

5. Conflict Handling

In a collaborative environment, two users drawing at the exact same time is inevitable.

Server-Side Ordering: Since WebSockets process events sequentially, the server acts as the final arbiter of time. The order in which events reach server.js is the "official" order of the drawing.

Context Isolation: We use ctx.save() and ctx.restore() in the remote drawing functions. This ensures that User A's "Eraser" setting doesn't accidentally change User B's active "Brush" setting mid-stroke.

Event Sourcing: By treating the canvas as a sequence of events rather than a static image, we avoid "pixel-overwrite" conflicts where one user might accidentally wipe another's work due to latency.