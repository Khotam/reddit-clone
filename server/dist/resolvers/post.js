"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
const Post_1 = require("../entities/Post");
const type_graphql_1 = require("type-graphql");
const isAuth_1 = require("../middlewares/isAuth");
const typeorm_1 = require("typeorm");
const Updoot_1 = require("../entities/Updoot");
let PostInput = class PostInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PostInput.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PostInput.prototype, "text", void 0);
PostInput = __decorate([
    type_graphql_1.InputType()
], PostInput);
let PostResolver = class PostResolver {
    textSnippet(root) {
        return root.text.slice(0, 50);
    }
    async voteStatus(post, { req, updootLoader }) {
        if (!req.session.userId)
            return null;
        console.log(`post.id`, post.id);
        console.log(`rqe.id`, req.session.userId);
        const updoot = await updootLoader.load({
            postId: post.id,
            userId: req.session.userId,
        });
        console.log(`updoot`, updoot);
        return updoot ? updoot.value : null;
    }
    async vote(postId, value, { req }) {
        const userId = req.session.userId;
        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;
        const updoot = await Updoot_1.Updoot.findOne({ where: { postId, userId } });
        if (updoot && updoot.value !== realValue) {
            await typeorm_1.getConnection().transaction(async (tm) => {
                await tm.query(`UPDATE updoot SET value = ${realValue} WHERE "postId" = ${postId} AND "userId" = ${userId}`);
                await tm.query(`
        UPDATE post SET points = points + ${realValue * 2} WHERE id = ${postId}`);
            });
        }
        else if (!updoot) {
            await typeorm_1.getConnection().transaction(async (tm) => {
                await tm.query(`
        INSERT INTO updoot ("postId", "userId", value) VALUES (${postId}, ${userId}, ${realValue});
  
      `);
                await tm.query(`
        UPDATE post SET points = points + ${realValue} WHERE id = ${postId};
        `);
            });
        }
        return true;
    }
    async posts(limit, cursor) {
        const realLimit = Math.min(50, limit);
        const replacements = [realLimit];
        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }
        const posts = await typeorm_1.getConnection().query(`
    SELECT
      p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
        'updatedAt', u."updatedAt"
      ) creator
    FROM post p
    INNER JOIN public.user u ON u.id = p."creatorId"
    ${cursor ? `WHERE p."createdAt" < $2` : ""}
    ORDER BY p."createdAt" DESC
    LIMIT $1
    `, replacements);
        return posts;
    }
    post(id) {
        return Post_1.Post.findOne(id, { relations: ["creator"] });
    }
    async createPost(input, { req }) {
        const post = await Post_1.Post.create(Object.assign(Object.assign({}, input), { creatorId: req.session.userId })).save();
        return post;
    }
    async updatePost(id, title, text, { req }) {
        const result = await typeorm_1.getConnection()
            .createQueryBuilder()
            .update(Post_1.Post)
            .set({
            title,
            text,
        })
            .where(`id = :id AND "creatorId" = :creatorId`, {
            id,
            creatorId: req.session.userId,
        })
            .returning("*")
            .execute();
        return result.raw[0];
    }
    async deletePost(id, { req }) {
        const res = await Post_1.Post.delete({ id, creatorId: req.session.userId });
        if (res.affected === 0) {
            return false;
        }
        return true;
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => String),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "textSnippet", null);
__decorate([
    type_graphql_1.FieldResolver(() => type_graphql_1.Int, { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "voteStatus", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("postId")),
    __param(1, type_graphql_1.Arg("value")),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "vote", null);
__decorate([
    type_graphql_1.Query(() => [Post_1.Post]),
    __param(0, type_graphql_1.Arg("limit", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("cursor", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    type_graphql_1.Query(() => Post_1.Post, { nullable: true }),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    type_graphql_1.Mutation(() => Post_1.Post),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("input")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    type_graphql_1.Mutation(() => Post_1.Post, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("title")),
    __param(2, type_graphql_1.Arg("text")),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
PostResolver = __decorate([
    type_graphql_1.Resolver(Post_1.Post)
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=post.js.map