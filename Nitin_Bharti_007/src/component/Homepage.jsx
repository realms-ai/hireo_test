import React, { useEffect, useState } from "react";
import { FaXTwitter } from "react-icons/fa6";
import { BsGlobe2 } from "react-icons/bs";
import { AiOutlineGithub } from "react-icons/ai";
import axios from "axios";
import { useUser } from "../context/UserContext";

const Homepage = () => {
  const [inputSearch, setInputSearch] = useState("");
  const [user, setUser] = useState("");
  const [gitHubUser, setGithubUser] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [userStatus, setUserStatus] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { setUserName } = useUser();

  useEffect(() => {
    if (user) {
      setUserName(user);
      axios
        .get(`https://api.github.com/users/${user}`)
        .then((res) => {
          if (res.data) {
            setGithubUser(res.data);
            setUserStatus(false);
            axios
              .get(
                `https://api.github.com/users/${user}/repos?sort=stars&order=desc`
              )
              .then((repoRes) => {
                setRepositories(repoRes.data);
              })
              .catch(() => {
                console.log("Error fetching repositories");
              });
          } else {
            setUserStatus(true);
            console.log("User data not found");
          }
        })
        .catch(() => {
          setUserStatus(true);
          console.log("Some error occurred");
        });
    }
  }, [user, setUserName]);

  const handleSearch = () => {
    setUser(inputSearch);
  };

  const handleInputChange = async (e) => {
    setInputSearch(e.target.value);
    if (e.target.value.length >= 3) {
      try {
        const response = await axios.get(
          `https://api.github.com/search/users?q=${e.target.value}`
        );
        setSuggestions(response.data.items);
      } catch (error) {
        console.log("Error fetching suggestions", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const highlightMatch = (text, query) => {
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const JoinedDate = gitHubUser
    ? new Date(gitHubUser.created_at)
        .toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
        .split(" ")
        .join(" ")
    : "";

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center py-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-semibold text-gray-900">
          Nitin <span className="text-teal-500">Tracking</span>
        </h2>
        <p className="text-lg text-gray-700 mt-2">
          Track GitHub Users & Repositories
        </p>
      </div>

      {/* Search Section */}
      <div className="relative w-full md:w-1/2 flex justify-center items-center gap-3 mb-8">
        <input
          type="text"
          value={inputSearch}
          onChange={handleInputChange}
          placeholder="Enter your Github Username"
          className="p-4 w-full rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-transform hover:scale-105"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="py-3 px-6 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-transform hover:scale-105"
        >
          Search
        </button>

        {/* Suggestions List with Scrollbar */}
        {suggestions.length > 0 && inputSearch.length >= 3 && (
          <div className="absolute w-full bg-white shadow-lg rounded-lg mt-2 z-10 max-h-60 overflow-y-auto top-full">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="cursor-pointer p-3 border-b hover:bg-gray-100 flex items-center gap-4"
                onClick={() => {
                  setUser(suggestion.login);
                  setSuggestions([]);
                }}
              >
                <img
                  src={suggestion.avatar_url}
                  alt={suggestion.login}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-gray-800">
                  {highlightMatch(suggestion.login, inputSearch)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Display User Profile */}
      {gitHubUser && !userStatus && (
        <div className="flex flex-col items-center mt-12 bg-white p-8 rounded-lg shadow-xl w-full md:w-2/3 lg:w-1/2">
          <img
            src={gitHubUser.avatar_url}
            alt={gitHubUser.login}
            className="w-40 h-40 rounded-full border-4 border-gray-100"
          />
          <h3 className="text-2xl font-semibold mt-4">{gitHubUser.login}</h3>
          <p className="text-gray-600 mt-2">Joined: {JoinedDate}</p>

          {/* Social Links */}
          <div className="mt-4 flex gap-6">
            <a
              href={gitHubUser.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <AiOutlineGithub className="text-3xl text-gray-800" />
            </a>
            {gitHubUser.twitter_username && (
              <a
                href={`https://twitter.com/${gitHubUser.twitter_username}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaXTwitter className="text-3xl text-blue-400" />
              </a>
            )}
            {gitHubUser.blog && (
              <a
                href={gitHubUser.blog}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsGlobe2 className="text-3xl text-gray-600" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Display Repositories */}
      {repositories.length > 0 && !userStatus && (
        <div className="mt-12 w-full md:w-4/5">
          <h3 className="text-3xl font-semibold text-gray-800 mb-6">
            Repositories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="bg-white shadow-lg p-6 rounded-lg flex flex-col justify-between h-full transition-transform hover:scale-105"
              >
                <h4 className="text-lg font-semibold text-gray-800">
                  {highlightMatch(repo.name, inputSearch)}
                </h4>
                <p className="text-gray-600 mt-2">{repo.description}</p>

                {/* Flex to push star and fork to the bottom */}
                <div className="mt-auto">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-800 block"
                  >
                    View on GitHub
                  </a>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gray-500">
                      ⭐ {repo.stargazers_count}
                    </span>
                    <span className="text-gray-500">🍴 {repo.forks_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message if User Not Found */}
      {userStatus && (
        <div className="mt-12 flex justify-center">
          <div className="bg-red-500 text-white p-4 rounded-lg shadow-md">
            <p className="font-semibold text-lg">Oops... User Not Found!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
