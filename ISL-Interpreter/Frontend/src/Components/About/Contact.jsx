import React from "react";

const Contact = ({ isDark }) => {
  const teamMembers = [
    {
      name: "Manu Sharma",
      role: "Full Stack Developer",
      github: "https://github.com/ManuStu-web",
      email: "Msharma.stu@gmail.com",
    },
    {
      name: "Ayush Yadav",
      role: "Frontend Developer",
      github: "https://github.com/yadavayush834",
      email: "ayushyadav999999h@gmail.com",
    },
    {
      name: "Lalit Bhardwaj",
      role: "Backend Developer",
      github: "https://github.com/lalitbhardwaj661-bot",
      email: "lalitbhardwaj661@gmail.com",
    },
    {
      name: "Harsh Wardhan",
      role: "UI/UX Designer",
      github: "https://github.com/Harshdecodes",
      email: "harshwardhan4506@gmail.com",
    },
  ];

  const pageStyle = {
    backgroundColor: isDark ? "#0E1334" : "#eeeded",
    flex: 1
  };

  const cardStyle = {
    background: isDark
      ? "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.15))"
      : "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))",
    boxShadow: isDark
      ? "0 10px 40px rgba(0,0,0,0.7)"
      : "0 10px 40px rgba(31,38,135,0.1)",
    borderColor: isDark
      ? "rgba(255,255,255,0.2)"
      : "rgba(31,38,135,0.1)",
    color: isDark ? "#e0e7ff" : "#333",
  };

  return (
    <div className="transition-all duration-300 mt-12" style={pageStyle}>
      <div className="container mx-auto px-4 py-16">
        <h2
          className="text-5xl font-bold text-center mb-16"
          style={{ color: isDark ? "#fff" : "#1a1a1a" }}
        >
          Our Team
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="p-8 rounded-xl shadow-2xl flex flex-col items-center text-center border transition-all duration-300 hover:scale-105"
              style={cardStyle}
            >
              <h3
                className="text-3xl font-bold mb-2"
                style={{ color: isDark ? "#fff" : "#000" }}
              >
                {member.name}
              </h3>

              <p
                className="text-lg mb-4"
                style={{ color: isDark ? "#a0aec0" : "#555" }}
              >
                {member.role}
              </p>

              <div className="flex gap-6 mt-4">
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl hover:scale-125 transition"
                  style={{ color: isDark ? "#fff" : "#1a1a1a" }}
                >
                  <i className="ri-github-fill"></i>
                </a>

                <a
                  href={`mailto:${member.email}`}
                  className="text-2xl hover:scale-125 transition"
                  style={{ color: isDark ? "#fff" : "#1a1a1a" }}
                >
                  <i className="ri-mail-fill"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
