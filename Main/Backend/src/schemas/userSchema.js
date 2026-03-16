import mongoose from 'mongoose';

const watchItemSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
    title: { type: String, trim: true, default: '' },
    name: { type: String, trim: true, default: '' },
    posterPath: { type: String, trim: true, default: '' },
    backdropPath: { type: String, trim: true, default: '' },
    releaseDate: { type: String, trim: true, default: '' },
    firstAirDate: { type: String, trim: true, default: '' },
    voteAverage: { type: Number, default: 0 },
    overview: { type: String, default: '' },
    genres: [{ type: Number }],
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['my-list', 'system', 'recommendation', 'account'],
      default: 'system',
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    metadata: {
      tmdbId: Number,
      mediaType: { type: String, enum: ['movie', 'tv'] },
    },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6, select: true },

    profile: {
      avatarUrl: { type: String, trim: true, default: '' },
      bio: { type: String, trim: true, maxlength: 300, default: '' },
      location: { type: String, trim: true, maxlength: 80, default: '' },
    },

    preferences: {
      selectedCountry: { type: String, uppercase: true, default: 'IN' },
      selectedLanguage: { type: String, lowercase: true, default: 'all' },
      browseType: {
        type: String,
        enum: ['all', 'movie', 'series', 'drama'],
        default: 'all',
      },
      themeMode: { type: String, default: 'default' },
      backgroundFx: { type: String, default: 'none' },
      familySafeMode: { type: Boolean, default: false },
      isAdultVerified: { type: Boolean, default: false },
      ageWarningDismissed: { type: Boolean, default: false },
    },

    myList: { type: [watchItemSchema], default: [] },
    notifications: { type: [notificationSchema], default: [] },

    stats: {
      totalSearches: { type: Number, default: 0 },
      totalWatched: { type: Number, default: 0 },
      totalListAdds: { type: Number, default: 0 },
    },

    auth: {
      provider: { type: String, enum: ['local', 'google'], default: 'local' },
      googleId: { type: String, default: '', index: true },
      lastLoginAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

userSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
