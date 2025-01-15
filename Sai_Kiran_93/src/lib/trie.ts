class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  repository: any;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.repository = null;
  }
}

export class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string, repository: any) {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
    current.repository = repository;
  }

  search(prefix: string): any[] {
    const results: any[] = [];
    let current = this.root;

    // Navigate to the last node of the prefix
    for (const char of prefix.toLowerCase()) {
      if (!current.children.has(char)) {
        return results;
      }
      current = current.children.get(char)!;
    }

    // Collect all words with the given prefix
    this.collectWords(current, results);
    return results;
  }

  private collectWords(node: TrieNode, results: any[]) {
    if (node.isEndOfWord) {
      results.push(node.repository);
    }

    for (const [_, child] of node.children) {
      this.collectWords(child, results);
    }
  }
}