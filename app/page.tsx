// File: app/page.tsx
import { Metadata } from "next";
import HomePage from "@/components/HomePage"; // Adjust this path based on where you move your HomePage component

// Frame configuration for Farcaster
const frame = {
  version: "1.0.0",
  imageUrl: `https://www.legacyframes.xyz/banner.png`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Legacy Frames Archive",
      url: `https://www.legacyframes.xyz/`,
      splashImageUrl: `https://www.legacyframes.xyz/icon.png`,
      splashBackgroundColor: "#10001D",
    },
  },
};

<<<<<<< Updated upstream
<<<<<<< Updated upstream
type Frame = {
  id: string;
  name: string;
  creator_name: string;
  creator_profile_url?: string;
  url: string;
  icon_url: string;
  created_at: string;
  tags?: string[];
  description?: string; // Added description field
};
=======
export const revalidate = 300;
>>>>>>> Stashed changes
=======
export const revalidate = 300;
>>>>>>> Stashed changes

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Legacy Frames Archive",
    description: "To preserve and enjoy V1 Frames",
    openGraph: {
      title: "Legacy Frames Archive",
      description: "To preserve and enjoy V1 Frames",
      images: [{ url: `https://www.legacyframes.xyz/banner.png` }],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  // Function to handle creator name click
  const handleCreatorClick = (e: React.MouseEvent, profileUrl: string | undefined) => {
    if (profileUrl) {
      e.preventDefault(); // Prevent the parent Link from navigating
      window.open(profileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const isLoading = isLoadingTags || isLoadingFrames;

  if (isLoading && frames.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#10001D]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10001D] text-white px-4 py-8">
      {/* Header with Logo and Add Frame button */}
      <header className="max-w-2xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <Image src="/logo.png" alt="Logo" width={204} height={50} priority />
        </div>
        <a 
          href="https://forms.gle/oqpNiuK6vkveHhNv9" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="px-4 py-2 bg-[#8C56FF] text-white rounded-full hover:opacity-90 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit Frame
        </a>
      </header>

      {/* Disclaimer Text */}
      <div className="text-gray-400 text-sm mb-6 max-w-2xl mx-auto">
        <p>This project was created to preserve the legacy of the V1 frame in Farcaster. However, there are no guarantees that each frame will continue to work as intended.</p>
      </div>
      
      {/* Tag Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagChange(tag.slug)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                currentTag === tag.slug
                  ? 'bg-[#8C56FF] text-white'
                  : 'bg-[#1D1D29] text-white hover:bg-[#2A2A3C]'
              }`}
            >
              {tag.name}
            </button>
          ))
        ) : (
          <div className="text-gray-400">No tags available</div>
        )}
      </div>

      {/* Frame List */}
      <section className="max-w-2xl mx-auto">
        {isLoadingFrames ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="flex flex-col">
            {frames.map((frame, index) => (
              <div key={frame.id}>
                <Link
                  href={`/frame/${encodeURIComponent(frame.id)}`}
                  className="flex items-start py-4 hover:opacity-80 transition-opacity"
                >
                  {/* Frame Icon */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                    {frame.icon_url ? (
                      <Image
                        src={frame.icon_url}
                        alt={frame.name}
                        width={64}
                        height={64}
                        className="object-cover"
                        unoptimized={true}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-600 flex items-center justify-center text-lg">
                        F
                      </div>
                    )}
                  </div>

                  {/* Frame Info */}
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">{frame.name}</h3>
                    
                    {/* Description */}
                    {frame.description && (
                      <p className="text-gray-400 text-sm mt-1 mb-1 line-clamp-2">
                        {frame.description}
                      </p>
                    )}
                    
                    <p 
                      onClick={(e) => handleCreatorClick(e, frame.creator_profile_url)}
                      className={`text-[#8C56FF] text-sm ${frame.creator_profile_url ? 'cursor-pointer hover:underline' : ''}`}
                    >
                      @{frame.creator_name}
                    </p>
                  </div>
                </Link>
                
                {/* Add separator line after each item except the last one */}
                {index < frames.length - 1 && (
                  <div className="border-b border-[#2A2A3C]"></div>
                )}
              </div>
            ))}

            {frames.length === 0 && !isLoadingFrames && (
              <div className="text-center py-10">
                <p className="text-gray-400">No frames found for this filter</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
=======
// This is the main page server component
export default function Page() {
  return <HomePage />;
>>>>>>> Stashed changes
=======
// This is the main page server component
export default function Page() {
  return <HomePage />;
>>>>>>> Stashed changes
}