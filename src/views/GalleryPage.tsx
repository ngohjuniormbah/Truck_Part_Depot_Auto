import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Camera, X } from "lucide-react";
import { GalleryItem } from "../types";

interface GalleryPageProps {
  galleryItems?: GalleryItem[];
  onAddGalleryItem?: (item: Partial<GalleryItem>) => Promise<void>;
  onNavigate?: (page: any, initialTab?: any) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ galleryItems }) => {
  const posts = galleryItems || [];
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Lightbox Modal State for clicking any gallery build
  const [activePost, setActivePost] = useState<GalleryItem | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Auto slideshow for the hero showcase
  useEffect(() => {
    if (posts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % posts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [posts.length]);

  const openModal = (post: GalleryItem, index = 0) => {
    setActivePost(post);
    setModalImageIndex(index);
  };

  const closeModal = () => {
    setActivePost(null);
  };

  return (
    <div className="py-16 sm:py-24 bg-white min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-2">
          <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block">
            Customer Rig Showcase
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight leading-tight">
            Customer Rig Gallery
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Real customer builds, heavy hauling rigs, and working trucks running reliable spare parts. Click any build to view all photos.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-neutral-200 p-8 max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 shadow-xs">
              <ImageIcon className="w-7 h-7 text-neutral-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-neutral-900">No Gallery Photos Yet</h2>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
                Customer rig pictures and truck build installations will appear here once published.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Slider */}
            <div className="relative overflow-hidden rounded-2xl shadow-sm border border-neutral-200 bg-neutral-950 cursor-pointer">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeSlideIndex * 100}%)` }}
              >
                {posts.map((item, idx) => {
                  const photos = item.images && item.images.length > 0 ? item.images : [item.imageUrl];
                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => openModal(item, 0)}
                      className="w-full shrink-0 flex flex-col"
                    >
                      <div className="relative">
                        <img
                          src={photos[0] || item.imageUrl}
                          alt={item.title || "Gallery rig"}
                          className="w-full h-80 sm:h-[440px] md:h-[520px] object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {photos.length > 1 && (
                          <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white text-xs font-mono px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow">
                            <Camera className="w-3.5 h-3.5" />
                            <span>Click to view all {photos.length} photos</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5 sm:p-7 bg-neutral-950 text-white border-t border-neutral-800">
                        <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                          <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                            {item.title}
                          </h3>
                          <span className="text-xs px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 font-semibold">
                            {item.truckBrand} {item.year ? `• ${item.year}` : ""}
                          </span>
                        </div>
                        {item.caption && (
                          <p className="text-sm text-neutral-300 leading-relaxed max-w-4xl whitespace-pre-line">
                            {item.caption}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlideIndex((prev) => (prev - 1 + posts.length) % posts.length);
                }}
                className="absolute left-4 top-40 sm:top-56 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center shadow-lg cursor-pointer z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlideIndex((prev) => (prev + 1) % posts.length);
                }}
                className="absolute right-4 top-40 sm:top-56 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center shadow-lg cursor-pointer z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Grid of Builds */}
            <div className="pt-6 space-y-6">
              <div className="border-b border-neutral-200 pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-950">
                  All Builds & Rig Posts
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500">
                  Click on any build to see all photos and installed specs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((item, idx) => {
                  const photos = item.images && item.images.length > 0 ? item.images : [item.imageUrl];
                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => openModal(item, 0)}
                      className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col cursor-pointer group"
                    >
                      <div className="aspect-[16/10] bg-neutral-100 overflow-hidden relative">
                        <img
                          src={photos[0] || item.imageUrl}
                          alt={item.title || "Rig build"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        {photos.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-neutral-950/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded flex items-center gap-1 shadow">
                            <Camera className="w-3 h-3" />
                            <span>{photos.length} photos</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                              {item.truckBrand} {item.year ? `• ${item.year}` : ""}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-neutral-900 group-hover:text-black">
                            {item.title}
                          </h3>
                          {item.caption && (
                            <p className="text-xs text-neutral-600 leading-relaxed mt-2 line-clamp-2">
                              {item.caption}
                            </p>
                          )}
                        </div>

                        {photos.length > 1 && (
                          <div className="pt-2 border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto pb-1">
                            {photos.slice(0, 4).map((p, pIdx) => (
                              <img
                                key={pIdx}
                                src={p}
                                alt="thumb"
                                className="w-10 h-10 object-cover rounded border border-neutral-200"
                              />
                            ))}
                            {photos.length > 4 && (
                              <span className="text-[11px] font-bold text-neutral-500 pl-1">
                                +{photos.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FULL MULTI-PHOTO VIEWER LIGHTBOX MODAL */}
      {activePost && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto p-5 sm:p-6 text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-lg font-bold">{activePost.title}</h3>
                <span className="text-xs text-neutral-400">
                  {activePost.truckBrand} {activePost.year ? `• ${activePost.year}` : ""}
                </span>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Large Active Photo */}
            {(() => {
              const modalPhotos =
                activePost.images && activePost.images.length > 0
                  ? activePost.images
                  : [activePost.imageUrl];
              const curImg = modalPhotos[modalImageIndex] || modalPhotos[0];

              return (
                <div className="space-y-3">
                  <div className="relative aspect-[16/10] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-neutral-800">
                    <img
                      src={curImg}
                      alt="Modal photo"
                      className="max-h-[60vh] w-auto max-w-full object-contain mx-auto"
                    />

                    {modalPhotos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setModalImageIndex((prev) =>
                              prev > 0 ? prev - 1 : modalPhotos.length - 1
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-neutral-950 flex items-center justify-center hover:bg-white"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setModalImageIndex((prev) =>
                              prev < modalPhotos.length - 1 ? prev + 1 : 0
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-neutral-950 flex items-center justify-center hover:bg-white"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {modalPhotos.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {modalPhotos.map((photo, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setModalImageIndex(idx)}
                          className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                            modalImageIndex === idx
                              ? "border-white ring-2 ring-white/30"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={photo} alt="thumb" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {activePost.caption && (
                    <p className="text-sm text-neutral-300 leading-relaxed pt-2">
                      {activePost.caption}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
