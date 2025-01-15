
class TrieNode {
    children: Map<string, TrieNode>;
    isEndOfWord: boolean;
  
    constructor() {
      this.children = new Map();
      this.isEndOfWord = false;
    }
  }
  
  export class Trie {
    root: TrieNode;
  
    constructor() {
      this.root = new TrieNode();
    }
  
    insert(word: string): void {
      let current = this.root;
      for (const char of word.toLowerCase()) {
        if (!current.children.has(char)) {
          current.children.set(char, new TrieNode());
        }
        current = current.children.get(char)!;
      }
      current.isEndOfWord = true;
    }
  
    search(prefix: string): string[] {
      let current = this.root;
      for (const char of prefix.toLowerCase()) {
        if (!current.children.has(char)) {
          return [];
        }
        current = current.children.get(char)!;
      }
      return this.collectWords(current, prefix.toLowerCase());
    }
  
    private collectWords(node: TrieNode, prefix: string): string[] {
      const results: string[] = [];
      if (node.isEndOfWord) {
        results.push(prefix);
      }
      for (const [char, childNode] of node.children) {
        results.push(...this.collectWords(childNode, prefix + char));
      }
      return results;
    }
  }
  
  