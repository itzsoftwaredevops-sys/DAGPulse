# Contributing to DAGPulse

Thank you for your interest in contributing to DAGPulse, the BlockDAG Real-Time Mining Dashboard!

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/dagpulse.git
   cd dagpulse
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start development server**:
   ```bash
   npm run dev
   ```

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code patterns in the repository
- Use meaningful variable and function names
- Keep components focused and reusable

### Frontend
- React 18 with TypeScript
- TailwindCSS for styling (no custom CSS unless necessary)
- TanStack Query for server state management
- Wouter for routing
- Shadcn UI components for UI elements

### Backend
- Node.js with Express
- Zod for schema validation
- WebSocket for real-time updates
- Type-safe endpoints matching frontend expectations

### Testing
- Test your changes thoroughly before submitting
- Verify real-time updates work correctly
- Check responsiveness on mobile devices

## Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and test them thoroughly

3. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add new mining metric to dashboard"
   git commit -m "fix: resolve WebSocket connection issue"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** with:
   - Clear description of changes
   - Why the change is needed
   - Any related issues
   - Screenshots (if UI changes)

## Areas to Contribute

- **Mining Algorithms**: Add support for additional algorithms
- **Charts & Visualization**: Enhance data visualization
- **Performance**: Optimize real-time updates
- **Mobile UX**: Improve mobile responsiveness
- **Documentation**: Help improve guides and docs
- **Bug Fixes**: Report and fix issues
- **Smart Contracts**: Enhance blockchain integration

## Reporting Issues

Found a bug? Please create an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, Node version)

## Architecture

See `FUNCTIONAL_ARCHITECTURE.md` for detailed system architecture and design decisions.

## Smart Contracts

Smart contract source is in `contracts/MiningRewards.sol`. See `contracts/README.md` for deployment and testing instructions.

## Questions?

- Open a GitHub issue
- Check existing documentation
- Review code comments and architecture docs

Thank you for contributing!
