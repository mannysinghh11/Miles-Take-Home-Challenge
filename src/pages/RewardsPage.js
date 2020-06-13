import React from 'react';

import '../styles/RewardsPage.css'


class RewardsPage extends React.Component {
	constructor(props){
		super(props);

		//Setting the State
		//Categories - stores all of the unique categories used, follow format given below

		//Rewards - stores all of the unique rewards used

		//isNewReward - helps with logic between moving between swimlanes

		//lastReward - helps with removing old instance of reward before adding a 
		//new one (ONLY when used when switching between swimlanes)

		//redoHistory - stores all of the user actions for the undo button

		//undoHistory - stores all of the user actions for the redo button
		this.state = {
			categories: [
			{
				name: "Rewards",
				rewards: []
			},
			{
				name: "C1",
				rewards: []
			},
			{
				name: "C2",
				rewards: []
			},
			{
				name: "C3",
				rewards: []
			},
			{
				name: "C4",
				rewards: []
			},
			{
				name: "C5",
				rewards: []
			},
			{
				name: "C6",
				rewards: []
			},
			],
			rewards: ["R1", "R2", "R3", "R4", "R5", "R6"],
			isNewReward: true,
			lastReward: ["Category", "Reward"],
			redoHistory: [],
			undoHistory: []

		}

		this.renderCategories = this.renderCategories.bind(this);
		this.renderRewards = this.renderRewards.bind(this);
		this.onDragStart = this.onDragStart.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.onDragOver = this.onDragOver.bind(this);
		this.deleteReward = this.deleteReward.bind(this);
		this.undoLast = this.undoLast.bind(this);
		this.redoLast = this.redoLast.bind(this);
		this.saveInformation = this.saveInformation.bind(this);
		this.loadLastSaved = this.loadLastSaved.bind(this);
		this.addHistoryEntry = this.addHistoryEntry.bind(this);
		this.addNewRewardInstance = this.addNewRewardInstance.bind(this);
		this.removeRewardInstance = this.removeRewardInstance.bind(this);
	}

	//Helper method to help with adding an entry to one of the two history arrays
	addHistoryEntry(action, rewardName, categoryName, historyArray){
		var history = {"action": action, "rewardName" : rewardName, "categoryName" : categoryName};
		var historyArray = this.state[historyArray];

		historyArray.push(history);

		return historyArray;
	}

	//Helper method to add a new instance of a reward to a specific category
	addNewRewardInstance(array, item){
		array.push(item);
		array.sort();
	}

	//Helper method to remove a instance of reward from a category
	removeRewardInstance(array, index){
		array.splice(index, 1);
	}

	//Method that figures out if it is a new instance, or simply moving between swimlanes
	//Updates the state accordingly
	onDragStart(e, dataR, dataC){
		var updatedData = [];
		if(dataC != null){
			updatedData.push(dataC.name);
			updatedData.push(dataR);
		}

		if(dataC != null){
			this.setState({
				isNewReward: false,
				lastReward: updatedData
			});
		}else{
			this.setState({
				isNewReward: true,
				lastReward: updatedData
			});
		}
	}

	onDragOver(e){
		e.preventDefault();
	}

	//Method gets call when a reward is dropped in the proper location
	onDrop(e, dataC, dataR){
		var updatedCategories = this.state.categories;
		var redoHistory = this.state.redoHistory;

		//Handle logic with storage

		//If moving between swim lanes
		if(this.state.isNewReward != true){
			//Remove old instance and add a new one
			for(var i = 1; i < updatedCategories.length; i++){
				//Removing old instance
				if(updatedCategories[i].name == this.state.lastReward[0]){
					for(var j = 0; j < updatedCategories[i].rewards.length; j++){
						if(this.state.lastReward[1] == updatedCategories[i].rewards[j]){
							this.removeRewardInstance(updatedCategories[i].rewards, j);
						}		
					}

					//Adding this action to the history array
					redoHistory = this.addHistoryEntry("delete", this.state.lastReward[1], updatedCategories[i].name, "redoHistory");

					this.setState({
						redoHistory: redoHistory
					});
				}
				
				//Adding new instance
				if(dataC.name == updatedCategories[i].name){
					this.addNewRewardInstance(dataC.rewards, dataR);

					//Adding this action to the history array
					redoHistory = this.addHistoryEntry("add", dataR, dataC.name, "redoHistory");

					this.setState({
						redoHistory: redoHistory
					});
				}
			}
		}else if(!dataC.rewards.includes(dataR)){ //Adding a brand new Reward
			//Adding new instance
			this.addNewRewardInstance(dataC.rewards, dataR);

			//Adding this action to the history array
			redoHistory = this.addHistoryEntry("add", dataR, dataC.name, "redoHistory");

			this.setState({
					redoHistory: redoHistory
			});
		}

		//Updating the variable that stores all of the state information before setting the state
		for(var i = 1; i < updatedCategories; i++){
			if(dataC == updatedCategories[i]){
				updatedCategories[i] == dataC;
			}
		}

		this.setState({
			categories: updatedCategories,
			isNewReward: false
		})
	}

	//Called when the delete button is clicked on a reward
	deleteReward(e, dataC, dataR){
		var redoHistory = this.state.redoHistory;

		//Ensure that reward being deleted is included
		if(dataC.rewards.includes(dataR)){
			var updatedCategories = this.state.categories

			//Find specific element to remove and splice the array
			for(var i = 0; i < dataC.rewards.length; i++){
				if(dataC.rewards[i] == dataR){
					this.removeRewardInstance(dataC.rewards, i);

					//Adding this action to the history array
					redoHistory = this.addHistoryEntry("delete", dataR, dataC.name, "redoHistory");

					this.setState({
						redoHistory: redoHistory
					});
				}
			}

			//Updating the variable that stores all of the state information before setting the state
			for(var i = 1; i < updatedCategories; i++){
				if(dataC == updatedCategories[i]){
					updatedCategories[i] == dataC;
				}
			}

			this.setState({
				categories: updatedCategories
			})
		}
	}

	//Called when the undo button is clicked
	undoLast(){
		var history = this.state.redoHistory.pop(); //Most recent entry in the redoHistory array
		var undoHistory = this.state.undoHistory; //Temp variable to update the undoHistory
		var updatedCategories = this.state.categories;

		//Ensure there is something to "undo"
		if(history !=null){
			for(var i = 0; i < updatedCategories.length; i++){
				if(history.action == "delete"){
					//Need to add last entry back
					if(updatedCategories[i].name == history.categoryName){
						if(!updatedCategories[i].rewards.includes(history.rewardName)){
							this.addNewRewardInstance(updatedCategories[i].rewards, history.rewardName);
						}
					}
				}else if(history.action == "add"){
					//Need to delete last entry
					if(updatedCategories[i].name == history.categoryName){
						for(var j = 0; j < updatedCategories[i].rewards.length; j++){
							if(history.rewardName == updatedCategories[i].rewards[j]){
								this.removeRewardInstance(updatedCategories[i].rewards, j);
							}		
						}
					}
				}
			}

			//Add this history into the undoHistory for the redo button
			undoHistory.push(history);

			this.setState({
				categories: updatedCategories,
				undoHistory: undoHistory
			});
		}
	}

	//Called when the redo button is clicked
	redoLast(){
		var history = this.state.undoHistory.pop(); //Most recent entry in the undoHistory array
		var redoHistory = this.state.redoHistory; //Temp variable to update redoHistory
		var updatedCategories = this.state.categories;

		//Ensure there is something to "redo"
		if(history != null){
			for(var i = 0; i < updatedCategories.length; i++){
				if(history.action == "add"){
					//Add last entry back
					if(updatedCategories[i].name == history.categoryName){
						if(!updatedCategories[i].rewards.includes(history.rewardName)){
							this.addNewRewardInstance(updatedCategories[i].rewards, history.rewardName);
						}
					}
				}else if(history.action == "delete"){
					//Delete last entry
					if(updatedCategories[i].name == history.categoryName){
						for(var j = 0; j < updatedCategories[i].rewards.length; j++){
							if(history.rewardName == updatedCategories[i].rewards[j]){
								this.removeRewardInstance(updatedCategories[i].rewards, j);
							}		
						}
					}
				}
			}

			//Add this history into the redoHistory for the undo button
			redoHistory.push(history);

			this.setState({
				categories: updatedCategories,
				redoHistory: redoHistory
			});
		}
	}

	//Called when the save button is clicked
	saveInformation(){
		var categories = this.state.categories;

		//Store the categories state into local storage
		localStorage.setItem('categories', JSON.stringify(categories));
	}

	//Called when the load last saved button is clicked
	loadLastSaved(){
		//Make sure there is something stored
		if(localStorage.getItem('categories') != null){
			var updatedCategories = JSON.parse(localStorage.getItem('categories'));
			var currentCategories = this.state.categories;
			var redoHistory = this.state.redoHistory;

			//Add all of the new entries that are different than currentState to the history array for undo functionality
			for(var i = 1; i < currentCategories.length; i++){
				if(currentCategories[i] != updatedCategories[i]){
					for(var j =  0; j < updatedCategories[i].rewards.length; j++){
						redoHistory = this.addHistoryEntry("add", updatedCategories[i].rewards[j], updatedCategories[i].name, "redoHistory");
					}
				}
			}

			this.setState({
				categories: updatedCategories,
				redoHistory: redoHistory
			})
		}
	}

	//Called to render the categories which are essentially just the table headers
	//Rendered from the categories state
	renderCategories(){
		return(
			this.state.categories.map((data, i) =>{
				return(
					<th key={data.name}>{data.name}</th>
				);
			})
		);
	}

	//Called to render the Rewards passing through the proper methods to each element
	//Rendering from the rewards state
	renderRewards(){
		return(
			this.state.rewards.map((data, i) =>{
				return(
					<tr key={i}>
						<td draggable className = "rewards" onDragStart={(e) => this.onDragStart(e, data)}>{data}</td>
						{this.state.categories.map((dataC, j) =>{
							if(dataC.name != "Rewards"){
								if(dataC.rewards.includes(data)){
									return <td key={j}>
									<div draggable className = "filledBox" id={data} onDragStart={(e) => this.onDragStart(e, data, dataC)} onDragOver={(e)=>this.onDragOver(e)} onDrop={(e)=>this.onDrop(e, dataC, data)}>{data}</div>
									<div className="delete" onClick={(e)=>this.deleteReward(e, dataC, data)}>✖ Delete</div>
									</td>
								}else{
									return <td key={j}><div className = "emptyBox" onDragStart={(e) => this.onDragStart(e, data)} onDragOver={(e)=>this.onDragOver(e)} onDrop={(e)=>this.onDrop(e, dataC, data)}></div></td>
								}
							}
						})}
					</tr>
				);
			})
		);
	}

	render() {
		return(
			<div className = "rewardPageContainer">
				<div className = "mainHeader">
					<h2>Rewards to Categories</h2>
				</div>

				<div className = "redoButtonCluster">
					<button className = "button" onClick={this.undoLast}>⟲ Undo</button>
					<button className = "button" onClick={this.redoLast}>⟳ Redo</button>
				</div>
				<table className = "rewardPageContainer">
					<thead>
					  <tr>
					  	{this.renderCategories()}
					  </tr>
					</thead>

					<tbody>
				  		{this.renderRewards()}
				  	</tbody>
				</table>
				<div className = "saveButtonCluster">
					<button className = "button" onClick={this.saveInformation}>↓ Save</button>
					<button className = "button" onClick={this.loadLastSaved}>↑ Load Last Saved</button>
				</div>
			</div>
		);
	}
}

export default RewardsPage;