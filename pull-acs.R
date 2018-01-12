#------------------------------------------------------------------------------#
## This is simple R-based code to pull a range of statistics from the 
## ACS 5-year for all tracts and block groups in Chicago
## Author: Nick Mader <nmader@chapinhall.org>
#------------------------------------------------------------------------------#

#------------------------------------------------------------------------------#
### Set up workspace -----------------------------------------------------------
#------------------------------------------------------------------------------#

rm(list=ls())
library(acs)
library(stringr)
library(magrittr) # This allows for use of the "%>%" or "pipe" command to chain commands together
library(dplyr)
library(data.table)
try(setwd(dir = "~/GitHub/CensusMap"),
    silent = TRUE)
grepv <- function(pattern, x) grep(pattern = pattern, x = x, value = TRUE)
cn <- function(x) colnames(x)

#------------------------------------------------------------------------------#
### Instantiate key for using Census API ---------------------------------------
#------------------------------------------------------------------------------#

keyFile <- read.delim(file = "./key/key.txt", header = F)
myKey <- as.character(keyFile[1,1])
api.key.install(myKey, file = "key.rda")
# /!\ Note, an API key must be obtained from the Census and saved in a txt file
# at the above location

### Tables of interest are below. See the Social Explorer page on the ACS
### to browse meta-data on all of the tables, including information about
### universe, comparability over time, and field definition.
### Also see the appendix tables, saved under ./doc/ACS_2015_SF_5YR_Appendices.xls
### which has information about geographic restrictions about table availability.

# B01003  - Total population
# B06007* - Place of Birth By Language Spoken at Home and Ability to Speak English in the United States
# B06011* - Median Income in the Past 12 Months (In 2015 Inflation-Adjusted Dollars) by Place of Birth in the United 
# B08122  - Transportation-to-work data for individual workers
# B08201  - Household Size By Vehicles Available
# B09001* - Population under 18 years of age
# B10001* - Presence of grandparents in home with children, by age of child (including counts <6 years of age)
# B10002* - Presence of grandparents in home with children, by presence of parent
# B13002* - Women 15 to 50 Years Who Had A Birth in the Past 12 Months By Marital Status and Age
# B15002  - Sex by Age by Educational Attainment for the Population 25 Years and Over
# B16002  - Household Language By Household Limited English Speaking Status
# B17013* - Detail on number of children in households in poverty
# B17020* - Poverty status in the past 12 months by Age
# B17022* - Ratio of Income to Poverty Level in the Past 12 Months of Families by Family Type By Presence of Related Children
# B17023* - Poverty Status in the Past 12 Months of Families by Household Type by Number of Own Children Under 18 Years
# B17026* - Ratio of Income to Poverty Level of Families in the Past 12 Months
# B19113* - Median Income by Family
# B23008  - Age of Own Children Under 18 Years in Families and Subfamilies by Living Arrangements by Employment Status of Parents
# B25106* - Tenure by Housing Costs as a Percentage of Household Income in the Past 12 Months

# * Indicates that the table is *not* available at the block group level 

### Defining our pull ----------------------------------------------------------

# Note that the elements in these tables can be examined on Social Explorer here:
# https://www.socialexplorer.com/acs2014/metadata/?ds=American+Community+Survey+2014&table=B17001A
pullSt <- "IL"
pullCounties <- "Cook County"
pullPlace <- "Chicago"
pullYear <- 2015
pullSpan <- 5
pullTables <- c("B01003", "B06007", "B06011", "B08122", "B08201", "B09001", "B10001",
                "B10002", "B13002", "B15002", "B16002", "B17013", "B17020", "B17022",
                "B17023", "B17026", "B19113", "B23008", "B25106")

geo.lookup(state=pullSt,
           county=pullCounties)
geo.lookup(state=pullSt,
           county=pullPlace)
myGeo_tr <- geo.make(state = pullSt, county = pullCounties, tract = "*")
myGeo_bg <- geo.make(state = pullSt, county = pullCounties, tract = "*", block.group = "*")

#------------------------------------------------------------------------------#
### PULL AND PREP META DATA ----------------------------------------------------
#------------------------------------------------------------------------------#

#------------------------------------------------------------------------------#
### Pull meta data for all of the tables ---------------------------------------
#------------------------------------------------------------------------------#
meta <- NULL
for (myT in pullTables){
  # Get meta data
  print(paste0("Pulling meta data for table ", myT))
  myMeta <-
    acs.lookup(endyear = pullYear,
               span = pullSpan,
               dataset = "acs",
               table.number = myT)
  meta <- rbind(meta, myMeta@results)
}
write.csv(meta, "./acs/raw-meta.csv",
          row.names = FALSE)

#------------------------------------------------------------------------------#
### Parse variable name tokens for renaming ------------------------------------
#------------------------------------------------------------------------------#

### Output table names
tableNames <- unique(meta$table.name)
write.csv(data.frame(tableName = tableNames, sub = NA),
          file = "./acs/ACS table names.csv",
          row.names = FALSE)

### Separate and output variable name tokens
tokens <- NULL
for (v in meta$variable.name){
  spl <- strsplit(v, split = ":")
  for (token in spl){
    token <- gsub("^\\s+|\\s+$", "", token)
    tokens <- c(tokens, token)
  }
}
tokens <- unique(tokens)
write.csv(data.frame(token = tokens, sub = NA),
          file = "./acs/ACS variable name tokens.csv",
          row.names = FALSE)

#------------------------------------------------------------------------------#
### Recode variable names with values hand-recoded in Excel --------------------
#------------------------------------------------------------------------------#

meta <- read.csv(file = "./acs/raw-meta.csv",
                 stringsAsFactors = FALSE)

### Recode table names --------------------------------------------------------#

names_upd <- read.csv("./acs/ACS table names -- recoded.csv")
meta$tableRecode <- names_upd$sub[match(meta$table.name, table = names_upd$tableName)]

### Recode variable names -----------------------------------------------------#

tokens_upd <- read.csv("./acs/ACS variable name tokens -- recoded.csv",
                       stringsAsFactors = FALSE) %>%
  within({
    # Need to do these substitutions so that parentheses are treated as literals,
    # and not as special regular expression terms in the gsub() values below
    token <-
      gsub("\\(", "\\\\(", token) %>%
      gsub("\\)", "\\\\)", x = .) %>%
      gsub("\\$", "\\\\$", x = .)
  })
# Reorder tokens short to long in an informal attempt to prevent substrings of
# longer strings from being recoded first, when then makes it impossible to
# recode the longer string
tokens_upd <- tokens_upd[order(nchar(tokens_upd$token), decreasing = TRUE),]
meta$fieldname <- meta$variable.name
for (nt in 1:nrow(tokens_upd)){
  meta$fieldname <- gsub(tokens_upd[nt, 1], tokens_upd[nt, 2], meta$fieldname)
}
# Separate names with underscores
meta$fieldname <- gsub(": ?", "_", meta$fieldname)

### Compile and clean duplicate and trailing underscores
meta$indname <- with(meta, paste(tableRecode, fieldname, sep = "_")) %>%
  gsub("_+", "_", x = .) %>%
  gsub("_$", "", x = .)


#------------------------------------------------------------------------------#
### Pull the tables one by one -------------------------------------------------
#------------------------------------------------------------------------------#

for (myG in c("tract", "blockgroup")){
  print(paste0("Pulling data for ", myG, " geographies"))
  acsData_g <- NULL
  
  if (myG == "tract") { myGeo <- myGeo_tr} else myGeo <- myGeo_bg
  for (myT in pullTables){
    print(paste0("--------- Pulling data for table ", myT))
    
    # Pull data
    acsPull <- acs.fetch(endyear = pullYear, span = 5, geography = myGeo, table.number = myT)
    acsEst <- acsPull@estimate       %>% data.frame()
    acsStd <- acsPull@standard.error %>% data.frame()
    
    # Recode column names
    colnames(acsEst) <-        meta$indname[match(colnames(acsEst), meta$variable.code)]
    colnames(acsStd) <- paste0(meta$indname[match(colnames(acsStd), meta$variable.code)], "_se")
    acsComb <- cbind(acsEst, acsStd)
    
    # Create a variable for geographic ID
    acsComb$geoid <- with(acsPull@geography, paste0(str_pad(state,  2, pad = "0"),
                                                    str_pad(county, 3, pad = "0"),
                                                    str_pad(tract,  6, pad = "0")))
    # If our geography is a block group, then also append the value of the blockgroup
    if (myG == "blockgroup") {
      acsComb$geoid <- paste0(acsComb$geoid, acsPull@geography$blockgroup)
    }
    rownames(acsComb) <- NULL
    
    # Pull data together
    if (is.null(acsData_g)){
      acsData_g <- acsComb
    } else {
      acsData_g <- merge(x = acsData_g, y = acsComb, by = "geoid")  
    }
  } # End of loop across table pulls
  acsData_g$detail <- myG
  assign(paste0("acsData_", myG), acsData_g)
} # End of loop across geographies

acsData <- rbind(acsData_tract, acsData_blockgroup)
write.csv(acsData, file = "./acs/Raw ACS pull.csv", row.names = FALSE)

#------------------------------------------------------------------------------#
### Inspect Missing Values in Raw Data Pulls -----------------------------------
#------------------------------------------------------------------------------#

df <- data.frame(var = colnames(acsData),
                 cnt = sapply(acsData, function(x) sum(is.na(x))))
df$tbl <- gsub("^([A-Za-z0-9]+)_.+", "\\1", df$var)
dfMiss <- group_by(df, tbl) %>% dplyr::summarise(NAs = sum(cnt))
dfMiss %>% data.frame()
  # Tables with missing data (at the block group) are: ByrthByMarA, GpAgeKid, GpPPrs,
  # HhLangAbil, HhPovNPres, IncToPov12, IncToPovByFam, PopALt18, Pov12ByA, TransPov

