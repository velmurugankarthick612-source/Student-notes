import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import ResourceCard from '../components/ResourceCard';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: '1,200+',
    totalResources: '5,000+',
    totalDownloads: '18,000+',
    approvedSubjects: '120+',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [deptRes, resRes] = await Promise.allSettled([
          api.get('/departments'),
          api.get('/resources/search', { params: { limit: 4, sort: 'newest' } }),
        ]);

        if (deptRes.status === 'fulfilled' && deptRes.value.success) {
          setDepartments(deptRes.value.data || []);
        }

        if (resRes.status === 'fulfilled' && resRes.value.success) {
          setRecentResources(resRes.value.data || []);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/resources?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/resources');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>The Centralized Academic Repository</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Find. Learn. <span className="text-indigo-600 dark:text-indigo-400">Share.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            A centralized platform for students to discover verified notes, question banks,
            solved university papers, and curriculum resources categorized by department, semester, and unit.
          </p>

          {/* Large Hero Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto relative flex items-center mb-8 shadow-xl shadow-indigo-500/5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 p-2"
          >
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic (e.g. Normalization, TCP/IP, Cryptography)..."
              className="w-full px-3 py-2.5 text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all shrink-0"
            >
              Search
            </button>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/resources"
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all"
            >
              <span>Explore All Resources</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
            >
              <span>Create Student Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-10 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-1">{stats.totalResources}</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Curated Resources</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{stats.totalDownloads}</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Downloads & Views</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{stats.totalUsers}</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Students</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-1">{stats.approvedSubjects}</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subjects Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Departments */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Departments & Branches</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Explore learning resources organized by your department</p>
            </div>
            <Link
              to="/subjects"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-semibold inline-flex items-center space-x-1 mt-3 sm:mt-0"
            >
              <span>View all subjects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.slice(0, 6).map((dept) => (
              <Link
                key={dept.id}
                to={`/resources?department=${dept.id}`}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 mb-3">
                    {dept.code}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {dept.description || 'Access syllabus units, lecture handouts, and semester materials.'}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>Browse Semesters</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Workflow */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              How StudyHub Works
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              The systematic academic hierarchy ensures you find exactly what you need in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center relative">
              <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-lg mb-4 shadow-md shadow-indigo-600/20">
                1
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Select Department</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Choose your major (e.g. CSE, IT, Cybersecurity) and your current semester.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center relative">
              <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-lg mb-4 shadow-md shadow-indigo-600/20">
                2
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Navigate Units</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Browse course subjects broken down into Unit 1 through Unit 5 syllabus topics.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center relative">
              <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-lg mb-4 shadow-md shadow-indigo-600/20">
                3
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Download & Learn</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                View verified PDFs, solved question banks, 2-mark & 16-mark revision sheets.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center relative">
              <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-lg mb-4 shadow-md shadow-indigo-600/20">
                4
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Upload & Review</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Contribute your own notes. Once approved by moderators, peers can rate and review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Added Resources Preview */}
      {recentResources.length > 0 && (
        <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Recently Added Resources</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Fresh notes submitted and verified for this semester</p>
              </div>
              <Link
                to="/resources"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentResources.map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-white font-bold text-lg">
                <GraduationCap className="w-6 h-6 text-indigo-400" />
                <span>StudyHub</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Empowering college students with peer-reviewed notes, question papers, and study resources.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Academic Navigation</h4>
              <ul className="space-y-2">
                <li><Link to="/resources" className="hover:text-white transition-colors">Resource Finder</Link></li>
                <li><Link to="/subjects" className="hover:text-white transition-colors">Departments & Subjects</Link></li>
                <li><Link to="/upload" className="hover:text-white transition-colors">Upload Study Notes</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-3">User Area</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-white transition-colors">Student Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register Account</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">My Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Security & Trust</h4>
              <p className="text-slate-400 leading-relaxed">
                All submitted academic documents undergo human moderation before becoming publicly searchable.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <p>© {new Date().getFullYear()} StudyHub. Production Academic Learning Platform.</p>
            <div className="flex space-x-6">
              <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
