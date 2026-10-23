import mongoose, { Schema, SchemaOptions } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IRepository } from '../repositories/repository.interface';
import { InMemoryRepository } from '../repositories/in-memory.repository';
import { config } from '../config/env';
import {
  Profile,
  Business,
  Trend,
  TrendMetric,
  Audience,
  GeographicSignal,
  DataSource,
  RawSignal,
  BusinessMatch,
  Opportunity,
  ActionPlan,
  ExpertReview,
  Experiment,
  ExperimentMetric,
  LearningRecord,
  Alert,
  SavedTrend,
  SystemLog,
} from '../models/types';

// Standard flexible schema options
const schemaOptions: SchemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  strict: false,
  versionKey: false,
};

// Generic Mongoose schemas keyed by 'id'
const ProfileSchema = new Schema({ id: { type: String, required: true, unique: true }, email: String }, schemaOptions);
const BusinessSchema = new Schema({ id: { type: String, required: true, unique: true }, owner_id: String }, schemaOptions);
const TrendSchema = new Schema({ id: { type: String, required: true, unique: true }, slug: String }, schemaOptions);
const TrendMetricSchema = new Schema({ id: { type: String, required: true, unique: true }, trend_id: String }, schemaOptions);
const AudienceSchema = new Schema({ id: { type: String, required: true, unique: true }, trend_id: String }, schemaOptions);
const GeographicSignalSchema = new Schema({ id: { type: String, required: true, unique: true }, trend_id: String }, schemaOptions);
const RawSignalSchema = new Schema({ id: { type: String, required: true, unique: true }, trend_id: String }, schemaOptions);
const DataSourceSchema = new Schema({ id: { type: String, required: true, unique: true } }, schemaOptions);
const BusinessMatchSchema = new Schema({ id: { type: String, required: true, unique: true }, business_id: String, trend_id: String }, schemaOptions);
const OpportunitySchema = new Schema({ id: { type: String, required: true, unique: true }, business_id: String }, schemaOptions);
const ActionPlanSchema = new Schema({ id: { type: String, required: true, unique: true }, business_id: String }, schemaOptions);
const ExpertReviewSchema = new Schema({ id: { type: String, required: true, unique: true }, action_plan_id: String }, schemaOptions);
const ExperimentSchema = new Schema({ id: { type: String, required: true, unique: true }, business_id: String }, schemaOptions);
const ExperimentMetricSchema = new Schema({ id: { type: String, required: true, unique: true }, experiment_id: String }, schemaOptions);
const LearningRecordSchema = new Schema({ id: { type: String, required: true, unique: true }, business_id: String }, schemaOptions);
const AlertSchema = new Schema({ id: { type: String, required: true, unique: true }, business_id: String }, schemaOptions);
const SavedTrendSchema = new Schema({ id: { type: String, required: true, unique: true }, user_id: String, trend_id: String }, schemaOptions);
const SystemLogSchema = new Schema({ id: { type: String, required: true, unique: true } }, schemaOptions);

export const ProfileModel = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
export const BusinessModel = mongoose.models.Business || mongoose.model('Business', BusinessSchema);
export const TrendModel = mongoose.models.Trend || mongoose.model('Trend', TrendSchema);
export const TrendMetricModel = mongoose.models.TrendMetric || mongoose.model('TrendMetric', TrendMetricSchema);
export const AudienceModel = mongoose.models.Audience || mongoose.model('Audience', AudienceSchema);
export const GeographicSignalModel = mongoose.models.GeographicSignal || mongoose.model('GeographicSignal', GeographicSignalSchema);
export const RawSignalModel = mongoose.models.RawSignal || mongoose.model('RawSignal', RawSignalSchema);
export const DataSourceModel = mongoose.models.DataSource || mongoose.model('DataSource', DataSourceSchema);
export const BusinessMatchModel = mongoose.models.BusinessMatch || mongoose.model('BusinessMatch', BusinessMatchSchema);
export const OpportunityModel = mongoose.models.Opportunity || mongoose.model('Opportunity', OpportunitySchema);
export const ActionPlanModel = mongoose.models.ActionPlan || mongoose.model('ActionPlan', ActionPlanSchema);
export const ExpertReviewModel = mongoose.models.ExpertReview || mongoose.model('ExpertReview', ExpertReviewSchema);
export const ExperimentModel = mongoose.models.Experiment || mongoose.model('Experiment', ExperimentSchema);
export const ExperimentMetricModel = mongoose.models.ExperimentMetric || mongoose.model('ExperimentMetric', ExperimentMetricSchema);
export const LearningRecordModel = mongoose.models.LearningRecord || mongoose.model('LearningRecord', LearningRecordSchema);
export const AlertModel = mongoose.models.Alert || mongoose.model('Alert', AlertSchema);
export const SavedTrendModel = mongoose.models.SavedTrend || mongoose.model('SavedTrend', SavedTrendSchema);
export const SystemLogModel = mongoose.models.SystemLog || mongoose.model('SystemLog', SystemLogSchema);

function sanitizeMongoUri(uri: string): string {
  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.+)@([^@]+)$/);
  if (match) {
    const [, protocol, user, pass, host] = match;
    const safeUser = encodeURIComponent(decodeURIComponent(user));
    const safePass = encodeURIComponent(decodeURIComponent(pass));
    return `${protocol}${safeUser}:${safePass}@${host}`;
  }
  return uri;
}

export class MongoRepository implements IRepository {
  private static isConnected = false;

  public static async connect(): Promise<boolean> {
    if (this.isConnected) return true;
    try {
      const cleanUri = sanitizeMongoUri(config.mongodbUri);
      const maskedUri = cleanUri.replace(/:([^:@]+)@/, ':****@');
      console.log(`[MongoDB] Connecting to ${maskedUri}...`);
      await mongoose.connect(cleanUri, {
        serverSelectionTimeoutMS: 5000,
      });
      this.isConnected = true;
      console.log('[MongoDB] Connected successfully to database');
      await MongoRepository.autoSeedIfEmpty();
      return true;
    } catch (err: any) {
      console.warn(`[MongoDB] Connection failed: ${err.message}. Falling back to in-memory store.`);
      this.isConnected = false;
      return false;
    }
  }

  public static async autoSeedIfEmpty(): Promise<void> {
    try {
      const count = await TrendModel.countDocuments();
      if (count === 0) {
        console.log('[MongoDB] Empty database detected. Auto-seeding initial dataset...');
        const inMemory = new InMemoryRepository();
        const data = inMemory.getSeedSnapshot();

        await Promise.all([
          ProfileModel.insertMany(data.profiles),
          BusinessModel.insertMany(data.businesses),
          TrendModel.insertMany(data.trends),
          TrendMetricModel.insertMany(data.trendMetrics),
          AudienceModel.insertMany(data.audiences),
          GeographicSignalModel.insertMany(data.geographicSignals),
          DataSourceModel.insertMany(data.dataSources),
          RawSignalModel.insertMany(data.rawSignals),
          BusinessMatchModel.insertMany(data.businessMatches),
          OpportunityModel.insertMany(data.opportunities),
          ActionPlanModel.insertMany(data.actionPlans),
          ExpertReviewModel.insertMany(data.expertReviews),
          ExperimentModel.insertMany(data.experiments),
          ExperimentMetricModel.insertMany(data.experimentMetrics),
          LearningRecordModel.insertMany(data.learningRecords),
          AlertModel.insertMany(data.alerts),
        ]);
        console.log('[MongoDB] Auto-seeding completed successfully.');
      }
    } catch (e: any) {
      console.error('[MongoDB] Auto-seeding error:', e.message);
    }
  }

  // --- Profiles ---
  public async getProfileById(id: string): Promise<Profile | null> {
    const doc = await ProfileModel.findOne({ id }).lean();
    return (doc as any) || null;
  }

  public async getProfileByEmail(email: string): Promise<Profile | null> {
    const doc = await ProfileModel.findOne({ email }).lean();
    return (doc as any) || null;
  }

  public async createProfile(profile: Partial<Profile>): Promise<Profile> {
    const doc = await ProfileModel.create({
      id: profile.id || uuidv4(),
      ...profile,
    });
    return doc.toObject() as any;
  }

  public async getAllProfiles(): Promise<Profile[]> {
    const docs = await ProfileModel.find().lean();
    return docs as any[];
  }

  // --- Businesses ---
  public async getBusinessById(id: string): Promise<Business | null> {
    const doc = await BusinessModel.findOne({ id }).lean();
    return (doc as any) || null;
  }

  public async getBusinessByOwnerId(ownerId: string): Promise<Business | null> {
    const doc = await BusinessModel.findOne({ owner_id: ownerId }).lean();
    return (doc as any) || null;
  }

  public async createBusiness(business: Partial<Business>): Promise<Business> {
    const doc = await BusinessModel.create({
      id: business.id || uuidv4(),
      ...business,
    });
    return doc.toObject() as any;
  }

  public async updateBusiness(id: string, updates: Partial<Business>): Promise<Business | null> {
    const doc = await BusinessModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return (doc as any) || null;
  }

  public async getAllBusinesses(): Promise<Business[]> {
    const docs = await BusinessModel.find().lean();
    return docs as any[];
  }

  // --- Trends ---
  public async getAllTrends(filter?: { category?: string; search?: string; status?: string }): Promise<Trend[]> {
    const query: any = {};
    if (filter?.category && filter.category !== 'All') {
      query.category = { $regex: new RegExp(`^${filter.category}$`, 'i') };
    }
    if (filter?.status) {
      query.lifecycle_stage = filter.status;
    }
    if (filter?.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { headline: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } },
      ];
    }
    const docs = await TrendModel.find(query).lean();
    return docs as any[];
  }

  public async getTrendById(id: string): Promise<Trend | null> {
    const doc = await TrendModel.findOne({ id }).lean();
    return (doc as any) || null;
  }

  public async getTrendBySlug(slug: string): Promise<Trend | null> {
    const doc = await TrendModel.findOne({ slug }).lean();
    return (doc as any) || null;
  }

  public async createTrend(trend: Partial<Trend>): Promise<Trend> {
    const doc = await TrendModel.create({
      id: trend.id || uuidv4(),
      ...trend,
    });
    return doc.toObject() as any;
  }

  public async updateTrend(id: string, updates: Partial<Trend>): Promise<Trend | null> {
    const doc = await TrendModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return (doc as any) || null;
  }

  // --- Trend Details ---
  public async getTrendMetrics(trendId: string, period?: string): Promise<TrendMetric[]> {
    const docs = await TrendMetricModel.find({ trend_id: trendId }).sort({ date: 1 }).lean();
    return docs as any[];
  }

  public async getTrendAudiences(trendId: string): Promise<Audience[]> {
    const docs = await AudienceModel.find({ trend_id: trendId }).lean();
    return docs as any[];
  }

  public async getTrendGeography(trendId: string): Promise<GeographicSignal[]> {
    const docs = await GeographicSignalModel.find({ trend_id: trendId }).lean();
    return docs as any[];
  }

  public async getTrendSignals(trendId: string): Promise<RawSignal[]> {
    const docs = await RawSignalModel.find({ trend_id: trendId }).lean();
    return docs as any[];
  }

  public async getDataSources(): Promise<DataSource[]> {
    const docs = await DataSourceModel.find().lean();
    return docs as any[];
  }

  // --- Saved Trends ---
  public async getSavedTrends(userId: string): Promise<Trend[]> {
    const saved = await SavedTrendModel.find({ user_id: userId }).lean();
    const trendIds = saved.map((s: any) => s.trend_id);
    const docs = await TrendModel.find({ id: { $in: trendIds } }).lean();
    return docs as any[];
  }

  public async saveTrend(userId: string, trendId: string): Promise<boolean> {
    await SavedTrendModel.findOneAndUpdate(
      { user_id: userId, trend_id: trendId },
      { $setOnInsert: { id: uuidv4(), user_id: userId, trend_id: trendId, saved_at: new Date().toISOString() } },
      { upsert: true }
    );
    return true;
  }

  public async unsaveTrend(userId: string, trendId: string): Promise<boolean> {
    await SavedTrendModel.deleteOne({ user_id: userId, trend_id: trendId });
    return true;
  }

  // --- Business Matches ---
  public async getBusinessMatch(businessId: string, trendId: string): Promise<BusinessMatch | null> {
    const doc = await BusinessMatchModel.findOne({ business_id: businessId, trend_id: trendId }).lean();
    return (doc as any) || null;
  }

  public async upsertBusinessMatch(match: Partial<BusinessMatch>): Promise<BusinessMatch> {
    const doc = await BusinessMatchModel.findOneAndUpdate(
      { business_id: match.business_id, trend_id: match.trend_id },
      { $set: match, $setOnInsert: { id: match.id || uuidv4() } },
      { upsert: true, new: true }
    ).lean();
    return doc as any;
  }

  public async getAllBusinessMatches(businessId: string): Promise<BusinessMatch[]> {
    const docs = await BusinessMatchModel.find({ business_id: businessId }).lean();
    return docs as any[];
  }

  // --- Opportunities ---
  public async getOpportunities(businessId?: string): Promise<Opportunity[]> {
    const query = businessId ? { business_id: businessId } : {};
    const docs = await OpportunityModel.find(query).lean();
    return docs as any[];
  }

  public async getOpportunityById(id: string): Promise<Opportunity | null> {
    const doc = await OpportunityModel.findOne({ id }).lean();
    return (doc as any) || null;
  }

  public async createOpportunity(opportunity: Partial<Opportunity>): Promise<Opportunity> {
    const doc = await OpportunityModel.create({
      id: opportunity.id || uuidv4(),
      ...opportunity,
    });
    return doc.toObject() as any;
  }

  public async updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity | null> {
    const doc = await OpportunityModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return (doc as any) || null;
  }

  // --- Action Plans ---
  public async getActionPlans(businessId?: string): Promise<ActionPlan[]> {
    const query = businessId ? { business_id: businessId } : {};
    const docs = await ActionPlanModel.find(query).lean();
    return docs as any[];
  }

  public async getActionPlanById(id: string): Promise<ActionPlan | null> {
    const doc = await ActionPlanModel.findOne({ id }).lean();
    return (doc as any) || null;
  }

  public async createActionPlan(plan: Partial<ActionPlan>): Promise<ActionPlan> {
    const doc = await ActionPlanModel.create({
      id: plan.id || uuidv4(),
      ...plan,
    });
    return doc.toObject() as any;
  }

  public async updateActionPlan(id: string, updates: Partial<ActionPlan>): Promise<ActionPlan | null> {
    const doc = await ActionPlanModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return (doc as any) || null;
  }

  // --- Expert Reviews ---
  public async getExpertReviews(status?: string): Promise<ExpertReview[]> {
    const query = status ? { status } : {};
    const docs = await ExpertReviewModel.find(query).lean();
    return docs as any[];
  }

  public async getExpertReviewByPlanId(planId: string): Promise<ExpertReview | null> {
    const doc = await ExpertReviewModel.findOne({ action_plan_id: planId }).lean();
    return (doc as any) || null;
  }

  public async createOrUpdateExpertReview(review: Partial<ExpertReview>): Promise<ExpertReview> {
    const doc = await ExpertReviewModel.findOneAndUpdate(
      { action_plan_id: review.action_plan_id },
      { $set: review, $setOnInsert: { id: review.id || uuidv4() } },
      { upsert: true, new: true }
    ).lean();
    return doc as any;
  }

  // --- Experiments ---
  public async getExperiments(businessId?: string): Promise<Experiment[]> {
    const query = businessId ? { business_id: businessId } : {};
    const docs = await ExperimentModel.find(query).lean();
    return docs as any[];
  }

  public async getExperimentById(id: string): Promise<Experiment | null> {
    const doc = await ExperimentModel.findOne({ id }).lean();
    return (doc as any) || null;
  }

  public async createExperiment(experiment: Partial<Experiment>): Promise<Experiment> {
    const doc = await ExperimentModel.create({
      id: experiment.id || uuidv4(),
      ...experiment,
    });
    return doc.toObject() as any;
  }

  public async updateExperiment(id: string, updates: Partial<Experiment>): Promise<Experiment | null> {
    const doc = await ExperimentModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return (doc as any) || null;
  }

  public async getExperimentMetrics(experimentId: string): Promise<ExperimentMetric[]> {
    const docs = await ExperimentMetricModel.find({ experiment_id: experimentId }).lean();
    return docs as any[];
  }

  public async addExperimentMetric(metric: Partial<ExperimentMetric>): Promise<ExperimentMetric> {
    const doc = await ExperimentMetricModel.create({
      id: metric.id || uuidv4(),
      ...metric,
    });
    return doc.toObject() as any;
  }

  // --- Learning Records ---
  public async getLearningRecords(businessId?: string): Promise<LearningRecord[]> {
    const query = businessId ? { business_id: businessId } : {};
    const docs = await LearningRecordModel.find(query).lean();
    return docs as any[];
  }

  public async createLearningRecord(record: Partial<LearningRecord>): Promise<LearningRecord> {
    const doc = await LearningRecordModel.create({
      id: record.id || uuidv4(),
      ...record,
    });
    return doc.toObject() as any;
  }

  // --- Alerts ---
  public async getAlerts(businessId: string, unreadOnly?: boolean): Promise<Alert[]> {
    const query: any = { business_id: businessId };
    if (unreadOnly) query.is_read = false;
    const docs = await AlertModel.find(query).sort({ created_at: -1 }).lean();
    return docs as any[];
  }

  public async markAlertRead(alertId: string): Promise<boolean> {
    await AlertModel.updateOne({ id: alertId }, { $set: { is_read: true } });
    return true;
  }

  public async createAlert(alert: Partial<Alert>): Promise<Alert> {
    const doc = await AlertModel.create({
      id: alert.id || uuidv4(),
      is_read: false,
      ...alert,
    });
    return doc.toObject() as any;
  }

  // --- System Logs ---
  public async logSystemAction(log: Partial<SystemLog>): Promise<void> {
    await SystemLogModel.create({
      id: uuidv4(),
      created_at: new Date().toISOString(),
      ...log,
    });
  }

  public async getSystemLogs(limit: number = 50): Promise<SystemLog[]> {
    const docs = await SystemLogModel.find().sort({ created_at: -1 }).limit(limit).lean();
    return docs as any[];
  }
}
