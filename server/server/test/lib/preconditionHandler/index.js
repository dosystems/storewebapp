"use strict";
import _ from "lodash";
import appRequest from "./../../http-requests";
import credentials from './../../data/credentials.json';
import User from "./../../models/user";
const defaultUser = new User(credentials.validUser);
/**
 *
 * @param {Object} suiteDescription
 * @return {Promise.<T>}
 */
export default {
    execute: function (suiteDescription = {}) {
        let httpRequestExecution = Promise.resolve();

        const entitiesToCreate = suiteDescription.create || [];
        const entitiesUpdates = suiteDescription.update || [];
        const entitiesToDelete = suiteDescription.remove || [];


        // Preparation step #1. Create entities if needed
        if (entitiesToCreate.length > 0) {

            entitiesToCreate.forEach(group => {
                group.nonCreatedList.forEach(entity => {
                    httpRequestExecution = httpRequestExecution.then(() => appRequest.createEntities(entity, group.user));
                });
            })

        }


        // Preparation step #3. Delete entities if needed
        if (entitiesToDelete.length > 0) {

            entitiesToDelete.forEach(group => {
                httpRequestExecution = httpRequestExecution.then(() => appRequest.deleteEntities(group.allowedToDeleteList, group.user));
            });

        }


        return httpRequestExecution.catch((err) => Promise.reject(`Precondition handler error, ${err}`));
    },

    groupPreconditions: groupByAuthor
}


function groupByAuthor(preconditionList = []) {
    const groupedList = [];
    const formattedList = [];

    for (let entityData of preconditionList) {

        if (Array.isArray(entityData)) {
            formattedList.push({
                author: defaultUser,
                entities: entityData
            });
        } else {
            formattedList.push({
                author: defaultUser,
                entities: preconditionList
            });
            break;
        }
    }

    formattedList.forEach(entityData => {
        let author = entityData.author;
        let entities = entityData.entities;

        const group = _.find(groupedList, { groupKey: author.email });

        if (group) {

            group.fullList = group.fullList.concat(entities);
            group.nonCreatedList = group.nonCreatedList.concat(filter(group.fullList, { isCreated: false }));
            group.allowedToDeleteList = group.allowedToDeleteList.concat(filter(group.nonCreatedList, { isDeletable: true }));

        } else {

            const group = {
                groupKey: author.email,
                user: author,
                fullList: entities
            };

            group.nonCreatedList = filter(group.fullList, { isCreated: false });
            group.allowedToDeleteList = filter(group.nonCreatedList, { isDeletable: true });

            groupedList.push(group);
        }
    });

    function filter(entitiesList, flags) {
        const filteredList = [];

        const conditions = {
            isDeletable(entity) {
                return [
                    'carrier', 'company', 'contact',
                    'customer', 'factor', 'location',
                    'shipment', 'user', 'shipmentasset',
                    'task'
                ].includes(entity.constructor.name.toLowerCase());
            },
            isCreated(entity) {
                return !!entity.getId();
            }
        };

        entitiesList.forEach(entity => {
            filteredList.push(entity);

            Object.keys(flags).forEach(flag => {
                if (conditions[flag](entity) !== flags[flag]) {
                    _.remove(filteredList, entity);
                }
            });
        });

        return filteredList;
    }

    return groupedList;
}

