const GITHUB_API_URL = 'https://api.github.com';

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  owner: {
    avatar_url: string;
    login: string;
  };
}

export const searchRepositories = async (query: string): Promise<Repository[]> => {
  try {
    const response = await fetch(
      `${GITHUB_API_URL}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }

    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw error;
  }
};