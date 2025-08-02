'use client';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    salary?: string;
    type: string;
    description: string;
    createdAt: string;
  };
  onClick?: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {job.title}
          </h3>
          <p className="text-gray-600">{job.company}</p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {job.type}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.location}
        </div>
        
        {job.salary && (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            {job.salary}
          </div>
        )}
      </div>
      
      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
        {job.description}
      </p>
      
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Опубликовано {new Date(job.createdAt).toLocaleDateString('ru-RU')}</span>
        <button className="text-blue-600 hover:text-blue-800 font-medium">
          Подробнее
        </button>
      </div>
    </div>
  );
} 