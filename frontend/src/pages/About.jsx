import React from 'react';
import { GraduationCap, ShieldCheck, Search, BookOpen, Heart, Users, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            About StudyHub
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            StudyHub was founded with a single mission: to end the chaotic search for syllabus-aligned
            engineering and university notes through a verified, structured, and peer-moderated academic hub.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Hierarchical Navigation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No more searching through random message groups. Resources are indexed strictly by
              Department, Semester, Subject, and Unit.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Human Moderation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every document uploaded is vetted for relevance, copyright sanity, and format integrity
              before becoming visible in student search results.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Community Driven</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Students can rate notes, write helpful peer reviews, bookmark revision sheets for
              upcoming semester exams, and flag obsolete material.
            </p>
          </div>
        </div>

        {/* Academic Workflow explanation */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Supported Material Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-700">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-indigo-500" />
              <span>Full PDF Notes</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-indigo-500" />
              <span>Question Banks</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-indigo-500" />
              <span>2-Mark & 16-Mark Q&A</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-indigo-500" />
              <span>Solved University Papers</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-indigo-500" />
              <span>Quick Revision Sheets</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-indigo-500" />
              <span>Lab Manuals & Codes</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-indigo-500" />
              <span>Lecture Slides</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-indigo-500" />
              <span>Curated Video Links</span>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center py-6">
          <Link
            to="/resources"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
          >
            <span>Start Exploring StudyHub</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
