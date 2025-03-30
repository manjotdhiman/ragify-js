# Contributing to Ragify.js

Thank you for your interest in contributing to Ragify.js! This document provides guidelines and instructions for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/ragify-js.git
   cd ragify-js
   ```
3. Install dependencies:
   ```bash
   yarn install
   ```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and single-purpose
- Use proper error handling and type checking

### TypeScript Guidelines

- Avoid using `any` type
- Avoid using non-null assertion operator (`!`)
- Avoid casting to unknown (e.g., `as unknown as T`)
- Define proper interfaces and types
- Use strict type checking

### String Handling

- Use double quotes (`"`) for strings
- Use string templates or `.join()` instead of string concatenation
- Use meaningful string constants

### Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Add integration tests for complex features
- Test error cases and edge conditions

### Documentation

- Update README.md for significant changes
- Add JSDoc comments for new functions and classes
- Update type definitions
- Add examples for new features

## Pull Request Process

1. Create a new branch for your feature:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:

   ```bash
   git commit -m "feat: description of your changes"
   ```

3. Push to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request from your fork to the main repository

### Commit Messages

Follow the conventional commits format:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes
- `refactor:` for code refactoring
- `test:` for adding or modifying tests
- `chore:` for maintenance tasks

Example:

```bash
git commit -m "feat: add support for Cohere embeddings"
```

## Feature Implementation Guidelines

### Adding New Embedding Providers

1. Create a new file in `src/embeddings/`
2. Implement the `Embedder` interface
3. Add rate limiting and retry logic
4. Add proper error handling
5. Add tests
6. Update the factory function in `src/embeddings/index.ts`

### Adding New Vector Stores

1. Create a new file in `src/vectorStores/`
2. Implement the `VectorStore` interface
3. Add caching support
4. Add proper error handling
5. Add tests
6. Update the factory function in `src/vectorStores/index.ts`

### Performance Considerations

- Use batch processing for multiple operations
- Implement proper caching strategies
- Add rate limiting for API calls
- Use efficient data structures
- Optimize memory usage

## Getting Help

- Open an issue for bugs or feature requests
- Join our community discussions
- Check existing issues and PRs

## Code Review Process

1. All PRs require at least one review
2. Address review comments promptly
3. Keep PRs focused and manageable
4. Update PR description as needed
5. Ensure CI checks pass

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a release tag
4. Publish to npm

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
